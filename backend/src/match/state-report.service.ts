import { GameServerEventsMap, MatchReportPayload, MatchServerEvents } from '@magic3t/api-types'
import { League, Team } from '@magic3t/common-types'
import { MatchRow, MatchRowGameMode, UserRow } from '@magic3t/database-types'
import { Inject, Injectable } from '@nestjs/common'
import { SocketsService } from '@/common/services/sockets.service'
import { deepClone } from '@/common/utils/misc'
import { MatchRepository, UserRepository } from '@/database'
import { RatingService } from '@/rating'
import { Match, MatchEventType } from './lib'

@Injectable()
export class MatchObserverService {
  constructor(
    @Inject('MatchSocketsService')
    private matchSocketsService: SocketsService<GameServerEventsMap>,
    private ratingService: RatingService,
    private userRepository: UserRepository,
    private matchRepository: MatchRepository
  ) {}

  /** Does everything xD */
  observe(match: Match, order: UserRow, chaos: UserRow, gameMode: MatchRowGameMode) {
    match.onMany([MatchEventType.Choice, MatchEventType.Surrender, MatchEventType.Timeout], () => {
      this.handleMatchStateUpdated(match, order, chaos)
    })

    match.on(MatchEventType.Finish, () => {
      this.handleMatchFinished(match, order, chaos, gameMode)
    })
  }

  private async handleMatchStateUpdated(match: Match, order: UserRow, chaos: UserRow) {
    const state = match.stateReport
    for (const player of [order, chaos]) {
      if (player.role === 'bot') continue
      this.matchSocketsService.emit(player._id, MatchServerEvents.StateReport, state)
    }
  }

  private async handleMatchFinished(
    match: Match,
    order: UserRow,
    chaos: UserRow,
    gameMode: MatchRowGameMode
  ) {
    const [newOrder, newChaos] = await (async () => {
      if (gameMode & MatchRowGameMode.Ranked) {
        const newOrder = deepClone(order)
        const newChaos = deepClone(chaos)
        await this.ratingService.update(newOrder, newChaos, match.getFinalScore(Team.Order)!)
        return [newOrder, newChaos]
      }
      return [order, chaos]
    })()

    const matchReport: MatchReportPayload = {
      matchId: match.id,
      winner: match.winner,
      [Team.Order]: null!,
      [Team.Chaos]: null!,
    }

    const matchRow: MatchRow = {
      _id: match.id,
      [Team.Order]: null!,
      [Team.Chaos]: null!,
      game_mode: gameMode,
      timestamp: new Date(),
      events: match.events,
      winner: match.winner,
    }

    // Fill in the match report and match model with the scores and LP gains
    for (const player of [
      {
        old: order,
        new: newOrder,
        team: Team.Order,
      },
      {
        old: chaos,
        new: newChaos,
        team: Team.Chaos,
      },
    ]) {
      const oldRating = await this.ratingService.getRating(player.old)
      const newRating = await this.ratingService.getRating(player.new)
      const oldLp = await this.ratingService.getTotalLp(player.old)
      const newLp = await this.ratingService.getTotalLp(player.new)
      const score = match.getFinalScore(player.team)!
      const lpGain = oldRating.league === League.Provisional ? 0 : newLp - oldLp

      matchReport[player.team] = {
        score,
        lpGain,
        newRating: newRating,
      }
      matchRow[player.team] = {
        uid: player.new._id,
        name: player.new.identification!.nickname,
        division: newRating.division,
        league: newRating.league,
        score,
        lp_gain: lpGain,
      }
    }

    // Save everything to the database
    this.matchRepository.create(matchRow) // Does not need to await
    if (gameMode & MatchRowGameMode.Ranked) {
      await Promise.all([
        this.userRepository.update(newOrder),
        this.userRepository.update(newChaos),
      ])
    }

    // Emit the match report to all players involved
    for (const player of [order, chaos]) {
      if (player.role === 'bot') continue
      this.matchSocketsService.emit(player._id, MatchServerEvents.MatchReport, matchReport)
    }
  }
}
