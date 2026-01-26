import {
  GameServerEventsMap,
  MatchReportPayload,
  MatchServerEvents,
  StateReportPayload,
} from '@magic3t/api-types'
import { League, Team } from '@magic3t/common-types'
import { Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { SocketsService } from '@/common'
import { RatingService } from '@/rating'
import { MatchFinishedEvent } from './events/match-finished-event'

/**
 * Service responsible for syncing match state and results to clients.
 */
@Injectable()
export class ClientSyncService {
  constructor(
    @Inject('MatchSocketsService')
    private readonly gameSocketService: SocketsService<GameServerEventsMap>,
    private readonly ratingService: RatingService
  ) {}

  /**
   * Sends the current match state report to a player.
   */
  // Since this is the only method that cares about StateReportPayload, we call it directly instead of emitting an event.
  sendStateReport(userId: string, stateReport: StateReportPayload) {
    this.gameSocketService.send(userId, MatchServerEvents.StateReport, stateReport)
  }

  /**
   * Sends the final match summary to players after the match is finished.
   */
  @OnEvent('match.finished')
  async sendMatchSummary(summary: MatchFinishedEvent) {
    const winner =
      summary.order.matchScore === 1
        ? Team.Order
        : summary.chaos.matchScore === 1
          ? Team.Chaos
          : null

    const orderLpGain = await this.getRawLpGain(summary.order)
    const chaosLpGain = await this.getRawLpGain(summary.chaos)

    const newOrderRating = await this.ratingService.getRatingData({
      k: summary.order.newRating.k,
      rating: summary.order.newRating.score,
      matches: summary.order.newRating.matches,
      challenger: summary.order.newRating.challenger,
    })

    const newChaosRating = await this.ratingService.getRatingData({
      k: summary.chaos.newRating.k,
      rating: summary.chaos.newRating.score,
      matches: summary.chaos.newRating.matches,
      challenger: summary.chaos.newRating.challenger,
    })

    const socketSummary: MatchReportPayload = {
      matchId: '',
      [Team.Order]: {
        lpGain: orderLpGain,
        newRating: newOrderRating,
        score: summary.order.matchScore,
      },
      [Team.Chaos]: {
        lpGain: chaosLpGain,
        newRating: newChaosRating,
        score: summary.chaos.matchScore,
      },
      winner,
    }

    for (const player of [summary.chaos, summary.order]) {
      if (player.row.data.role === 'bot') continue
      this.gameSocketService.send(player.id, MatchServerEvents.MatchReport, socketSummary)
    }
  }

  private async getRawLpGain(team: MatchFinishedEvent['order' | 'chaos']): Promise<number> {
    const oldRatingData = await this.ratingService.getRatingData({
      k: team.row.data.elo.k,
      rating: team.row.data.elo.score,
      matches: team.row.data.elo.matches,
      challenger: team.row.data.elo.challenger,
    })

    // If the player was provisional, hide LP gains.
    if (oldRatingData.league === League.Provisional) {
      return 0
    }

    const oldLp = await this.ratingService.getRawLP(team.row.data.elo.score)
    const newLp = await this.ratingService.getRawLP(team.newRating.score)
    return newLp - oldLp
  }
}
