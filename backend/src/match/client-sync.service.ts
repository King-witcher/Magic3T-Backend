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
    // Determine winner
    const winner =
      summary.order.matchScore === 1
        ? Team.Order
        : summary.chaos.matchScore === 1
          ? Team.Chaos
          : null

    // Get old and new ratings
    const oldOrderRating = await this.ratingService.getRatingConverter(summary.order.row.data.elo)
    const oldChaosRating = await this.ratingService.getRatingConverter(summary.chaos.row.data.elo)

    // Get up to date ratings
    const newOrderRating = await this.ratingService.getRatingConverter(summary.order.newRating)
    const newChaosRating = await this.ratingService.getRatingConverter(summary.chaos.newRating)

    // Calculate LP gains
    const orderLpGain = newOrderRating.getLpGapAgainst(oldOrderRating)
    const chaosLpGain = newChaosRating.getLpGapAgainst(oldChaosRating)

    // Create a match summary to be sent via socket
    const socketSummary: MatchReportPayload = {
      matchId: '',
      [Team.Order]: {
        lpGain: orderLpGain,
        newRating: newOrderRating.ratingData,
        score: summary.order.matchScore,
      },
      [Team.Chaos]: {
        lpGain: chaosLpGain,
        newRating: newChaosRating.ratingData,
        score: summary.chaos.matchScore,
      },
      winner,
    }

    // Send the summary to both players, unless one of them is a bot
    for (const player of [summary.chaos, summary.order]) {
      if (player.row.data.role === 'bot') continue
      this.gameSocketService.send(player.id, MatchServerEvents.MatchReport, socketSummary)
    }
  }
}
