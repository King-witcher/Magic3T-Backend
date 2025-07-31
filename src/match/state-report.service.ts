import { Inject, Injectable } from '@nestjs/common'
import { Match, MatchEventType } from './lib'
import {
  GameMode,
  GameServerEventsMap,
  League,
  MatchModel,
  MatchResults,
  MatchServerEvents,
  Team,
  UserModel,
} from '@magic3t/types'
import { SocketsService } from '@/common/services/sockets.service'
import { RatingService } from '@/rating'
import { deepClone } from '@/common/utils/misc'
import { MatchRepository, UserRepository } from '@/database'

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
  observe(
    match: Match,
    order: UserModel,
    chaos: UserModel,
    gameMode: GameMode
  ) {
    match.onMany(
      [MatchEventType.Choice, MatchEventType.Surrender, MatchEventType.Timeout],
      () => {
        this.handleMatchStateUpdated(match, order, chaos)
      }
    )

    match.on(MatchEventType.Finish, () => {
      this.handleMatchFinished(match, order, chaos, gameMode)
    })
  }

  private async handleMatchStateUpdated(
    match: Match,
    order: UserModel,
    chaos: UserModel
  ) {
    const state = match.stateReport
    for (const player of [order, chaos]) {
      if (player.role === 'bot') continue
      this.matchSocketsService.emit(
        player._id,
        MatchServerEvents.StateReport,
        state
      )
    }
  }

  private async handleMatchFinished(
    match: Match,
    order: UserModel,
    chaos: UserModel,
    gameMode: GameMode
  ) {
    const [newOrder, newChaos] = await (async () => {
      if (gameMode & GameMode.Ranked) {
        const newOrder = deepClone(order)
        const newChaos = deepClone(chaos)
        await this.ratingService.update(
          newOrder,
          newChaos,
          match.getFinalScore(Team.Order)!
        )
        return [newOrder, newChaos]
      }
      return [order, chaos]
    })()

    const matchReport: MatchResults = {
      matchId: match.id,
      winner: match.winner,
      [Team.Order]: null!,
      [Team.Chaos]: null!,
    }
    const matchModel: MatchModel = {
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
      console.log(
        'final score of',
        player.new.identification?.nickname,
        'is',
        score
      )
      const lpGain = oldRating.league === League.Provisional ? 0 : newLp - oldLp

      matchReport[player.team] = {
        score,
        lpGain,
        newRating: newRating,
      }
      matchModel[player.team] = {
        uid: player.new._id,
        name: player.new.identification!.nickname,
        division: newRating.division,
        league: newRating.league,
        score,
        lp_gain: lpGain,
      }
    }

    // Save everything to the database
    this.matchRepository.create(matchModel) // Does not need to await
    if (gameMode & GameMode.Ranked) {
      await Promise.all([
        this.userRepository.update(newOrder),
        this.userRepository.update(newChaos),
      ])
    }

    // Emit the match report to all players involved
    for (const player of [order, chaos]) {
      if (player.role === 'bot') continue
      this.matchSocketsService.emit(
        player._id,
        MatchServerEvents.MatchReport,
        matchReport
      )
    }
  }
}
