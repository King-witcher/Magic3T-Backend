import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'

import { SocketsService } from '@/common'
import { BaseError } from '@/common/errors/base-error'
import { BotName, UserRepository } from '@/database'
import { MatchService } from '@/match'
import { AlreadyInGameError } from './errors/already-in-game.error'
import { QueueEmitType } from './types'

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name, { timestamp: true })
  casualPendingUid: string | null = null
  rankedPendingUid: string | null = null

  constructor(
    private matchService: MatchService,
    private usersService: UserRepository,
    @Inject('QueueSocketsService')
    private queueSocketsService: SocketsService<QueueEmitType>
  ) {}

  private async enqueueInternal(userId: string, mode: 'casual' | 'ranked') {
    if (!this.matchService.isAvailable(userId)) {
      this.logger.error(`player "${userId}" unavailable for queue: in game`)
      throw new AlreadyInGameError()
    }

    if (mode === 'casual') {
      throw new BaseError(
        'casual mode is temporarily disabled',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
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

        this.queueSocketsService.emit(pending, 'matchFound', {
          matchId,
          opponentId: userId,
        })
        this.queueSocketsService.emit(userId, 'matchFound', {
          matchId,
          opponentId: pending,
        })
      }
    }
  }

  enqueue(userId: string, mode: 'casual' | 'ranked') {
    this.enqueueInternal(userId, mode)
    const userQueueModes = this.getQueueModes(userId)
    this.queueSocketsService.emit(userId, 'queueAcepted', { mode: 'casual' })
    this.queueSocketsService.emit(userId, 'queueModes', userQueueModes)
  }

  getQueueModes(uid: string) {
    return {
      casual: this.casualPendingUid === uid,
      ranked: this.rankedPendingUid === uid,
    }
  }

  /// Tells if a user is already in the queue.
  isInQueue(userId: string) {
    return this.casualPendingUid === userId || this.rankedPendingUid === userId
  }

  /// Dequeues a user from whatever mode he could be in.
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
    this.queueSocketsService.emit(userId, 'queueModes', userQueueModes)
  }

  getUserCount() {
    return {
      casual: this.casualPendingUid ? 1 : 0,
      ranked: this.rankedPendingUid ? 1 : 0,
    }
  }

  async createBotMatch(userId: string, botName: BotName) {
    const matchId = await this.matchService.createPvCMatch(userId, botName)

    this.queueSocketsService.emit(userId, 'matchFound', {
      matchId,
      opponentId: '',
    })
  }

  async createRandomBotMatch(userId: string) {
    const botIndex = Math.floor(Math.random() * 4) // ALERTA DE GAMBIARRA
    const matchId = await this.matchService.createPvCMatch(
      userId,
      `bot${botIndex}` as BotName
    )

    this.queueSocketsService.emit(userId, 'matchFound', {
      matchId,
      opponentId: '',
    })
  }

  async createFairBotMatch(userId: string) {
    const userProfile = await this.usersService.get(userId)
    if (!userProfile) throw new InternalServerErrorException('user not found')
    const userRating = userProfile.glicko.rating

    const bots = await this.usersService.getBots()

    // TODO: Work with probabilities instead of always making the player play against the nearest.

    // Finds the bot with the closest rating
    let closestIndex = 0
    {
      let closestDistance = Number.POSITIVE_INFINITY
      bots.forEach((bot, currentIndex) => {
        const botRating = bot.glicko.rating
        const currentDistance = Math.abs(botRating - userRating)
        if (currentDistance < closestDistance) {
          closestDistance = currentDistance
          closestIndex = currentIndex
        }
      })
    }
    const matchId = await this.matchService.createPvCMatch(
      userId,
      `bot${closestIndex}` as BotName
    )

    this.queueSocketsService.emit(userId, 'matchFound', {
      matchId,
      opponentId: bots[closestIndex]._id,
    })
  }
}
