import { Team } from '@magic3t/common-types'
import { MatchRow, MatchRowGameMode, UserRow } from '@magic3t/database-types'
import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { FieldValue, UpdateData } from 'firebase-admin/firestore'
import { MatchRepository, UserRepository } from '@/database'
import { RatingService } from '@/rating'
import { MatchFinishedEvent } from './events/match-finished-event'

/**
 * Service responsible for persisting match results and updating user statistics after a match is finished.
 */
@Injectable()
export class PersistanceService {
  constructor(
    private usersRepository: UserRepository,
    private matchesRepository: MatchRepository,
    private ratingService: RatingService
  ) {}

  // Updates user rows after match is finished, considering rating changes if ranked.
  @OnEvent('match.finished')
  async updateUser(matchSummary: MatchFinishedEvent) {
    const winner = this.determineWinner(matchSummary)

    // MatchRow.stats update
    const orderUpdate = this.buildStatsUpdate(winner, 'order')
    const chaosUpdate = this.buildStatsUpdate(winner, 'chaos')

    // MatchRow.elo update if ranked
    if (matchSummary.ranked) {
      orderUpdate.elo = matchSummary.order.newRating
      chaosUpdate.elo = matchSummary.chaos.newRating
    }

    await Promise.all([
      this.usersRepository.update(matchSummary.order.id, orderUpdate),
      this.usersRepository.update(matchSummary.chaos.id, chaosUpdate),
    ])
  }

  // Persists the match row after match is finished.
  @OnEvent('match.finished')
  async persistMatch(matchSummary: MatchFinishedEvent) {
    const winner = this.determineWinner(matchSummary)

    // Get RatingData from the rating service (to get division, league, etc)
    const orderRating = await this.ratingService.getRatingData({
      k: matchSummary.order.newRating.k,
      rating: matchSummary.order.newRating.score,
      matches: matchSummary.order.newRating.matches,
    })
    const chaosRating = await this.ratingService.getRatingData({
      k: matchSummary.chaos.newRating.k,
      rating: matchSummary.chaos.newRating.score,
      matches: matchSummary.chaos.newRating.matches,
    })

    // Calculate LP gains
    const orderLpGain = await this.getRawLpGain(matchSummary.order)
    const chaosLpGain = await this.getRawLpGain(matchSummary.chaos)

    const row: MatchRow = {
      [Team.Order]: {
        division: orderRating.division,
        league: orderRating.league,
        lp_gain: orderLpGain,
        name: matchSummary.order.row.data.identification.nickname,
        score: matchSummary.order.matchScore,
        uid: matchSummary.order.id,
      },
      [Team.Chaos]: {
        division: chaosRating.division,
        league: chaosRating.league,
        lp_gain: chaosLpGain,
        name: matchSummary.chaos.row.data.identification.nickname,
        score: matchSummary.chaos.matchScore,
        uid: matchSummary.chaos.id,
      },
      events: matchSummary.events,
      game_mode: matchSummary.ranked ? MatchRowGameMode.Ranked : MatchRowGameMode.Casual,
      winner: winner === 'chaos' ? Team.Chaos : winner === 'order' ? Team.Order : null,
      timestamp: matchSummary.startedAt,
    }

    await this.matchesRepository.create(row)
  }

  private determineWinner(matchSummary: MatchFinishedEvent): 'order' | 'chaos' | 'draw' {
    if (matchSummary.order.matchScore === 1) return 'order'
    if (matchSummary.chaos.matchScore === 1) return 'chaos'
    return 'draw'
  }

  private async getRawLpGain(team: MatchFinishedEvent['order' | 'chaos']): Promise<number> {
    const oldLp = await this.ratingService.getRawLP(team.row.data.elo.score)
    const newLp = await this.ratingService.getRawLP(team.newRating.score)
    return newLp - oldLp
  }

  private buildStatsUpdate(
    winner: 'order' | 'chaos' | 'draw',
    playerType: 'order' | 'chaos'
  ): UpdateData<UserRow> {
    const update: UpdateData<UserRow> = {}

    if (playerType === winner) {
      update['stats.wins'] = FieldValue.increment(1)
    } else if (winner === 'draw') {
      update['stats.draws'] = FieldValue.increment(1)
    } else {
      update['stats.defeats'] = FieldValue.increment(1)
    }

    return update
  }
}
