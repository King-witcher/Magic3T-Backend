import { QueueServerEvents, QueueServerEventsMap } from '@magic3t/api-types'
import { BotName } from '@magic3t/database-types'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { respondError, SocketsService } from '@/common'
import { MatchService } from '@/match'

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name, { timestamp: true })
  casualPendingUid: string | null = null
  rankedPendingUid: string | null = null

  constructor(
    private matchService: MatchService,
    @Inject('QueueSocketsService')
    private queueSocketsService: SocketsService<QueueServerEventsMap>
  ) {}

  private async enqueueInternal(userId: string, mode: 'casual' | 'ranked') {
    if (!this.matchService.isAvailable(userId)) {
      this.logger.error(`player "${userId}" unavailable for queue: in game`)
      respondError(
        'already-in-game',
        HttpStatus.CONFLICT,
        'You are already in a match and cannot queue until the match ends'
      )
    }

    if (mode === 'casual') {
      respondError('not-implemented', 501, 'Casual mode is not implemented yet')
    }
    if (mode === 'ranked') {
      if (!this.rankedPendingUid) {
        this.rankedPendingUid = userId
        this.logger.log(`userId ${userId} joined ranked queue`)
      } else if (this.rankedPendingUid !== userId) {
        const pending = this.rankedPendingUid
        this.logger.log(`found a ranked match between ${pending} and ${userId}`)

        this.dequeue(pending)
        const matchId = await this.matchService.createPvPMatch(pending, userId)

        this.queueSocketsService.send(pending, QueueServerEvents.MatchFound, {
          matchId,
          opponentId: userId,
        })
        this.queueSocketsService.send(userId, QueueServerEvents.MatchFound, {
          matchId,
          opponentId: pending,
        })
      }
    }
  }

  /** Adds a user to the queue in the specified mode. */
  enqueue(userId: string, mode: 'casual' | 'ranked') {
    this.enqueueInternal(userId, mode)
    const userQueueModes = this.getQueueModes(userId)
    this.queueSocketsService.send(userId, QueueServerEvents.QueueAccepted, {
      mode,
    })
    this.queueSocketsService.send(userId, QueueServerEvents.QueueModes, userQueueModes)
  }

  /** Gets the queue modes a user is currently in. */
  getQueueModes(uid: string) {
    return {
      casual: this.casualPendingUid === uid,
      ranked: this.rankedPendingUid === uid,
    }
  }

  /** Determines if a user is already in the queue. */
  isInQueue(userId: string) {
    return this.casualPendingUid === userId || this.rankedPendingUid === userId
  }

  /** Dequeues a user from a game mode. If no mode is specified, removes from both */
  dequeue(userId: string, mode?: 'casual' | 'ranked') {
    if ((mode || 'casual') === 'casual' && this.casualPendingUid === userId) {
      this.casualPendingUid = null
      this.logger.log(`userId ${userId} left casual queue`)
    }

    if ((mode || 'ranked') === 'ranked' && this.rankedPendingUid === userId) {
      this.rankedPendingUid = null
      this.logger.log(`userId ${userId} left ranked queue`)
    }

    const userQueueModes = this.getQueueModes(userId)
    this.queueSocketsService.send(userId, QueueServerEvents.QueueModes, userQueueModes)
  }

  /** Gets the count of users currently in each queue mode. */
  getUserCount() {
    return {
      casual: this.casualPendingUid ? 1 : 0,
      ranked: this.rankedPendingUid ? 1 : 0,
    }
  }

  /** Creates a match between a user and a specified bot. */
  async createBotMatch(userId: string, botName: BotName) {
    // Create a match
    const matchId = await this.matchService.createPlayerVsBot(userId, botName)

    // Notify the user
    this.queueSocketsService.send(userId, QueueServerEvents.MatchFound, {
      matchId,
      opponentId: '', // FIXME: bot id
    })
  }
}
