import {
  GameServerEventsMap,
  MatchReportPayload,
  MatchServerEvents,
  StateReportPayload,
} from '@magic3t/api-types'
import { Team } from '@magic3t/common-types'
import { Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { SocketsService } from '@/common'
import { RatingService } from '@/rating'
import { MatchFinishedEvent } from './events/match-finished-event'

@Injectable()
export class ClientSyncService {
  constructor(
    @Inject('MatchSocketsService')
    private readonly gameSocketService: SocketsService<GameServerEventsMap>,
    private readonly ratingService: RatingService
  ) {}

  sendStateReport(userId: string, stateReport: StateReportPayload) {
    this.gameSocketService.send(userId, MatchServerEvents.StateReport, stateReport)
  }

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
    })

    const newChaosRating = await this.ratingService.getRatingData({
      k: summary.chaos.newRating.k,
      rating: summary.chaos.newRating.score,
      matches: summary.chaos.newRating.matches,
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
    const oldLp = await this.ratingService.getRawLP(team.row.data.elo.score)
    const newLp = await this.ratingService.getRawLP(team.newRating.score)
    return newLp - oldLp
  }
}
