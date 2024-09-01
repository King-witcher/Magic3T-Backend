import { Inject, Injectable } from '@nestjs/common'

import { SocketsService } from '@/common'
import { MatchService } from '@/match'
import { QueueEmitType } from './types'
import { BotName } from '@/database'

@Injectable()
export class QueueService {
  casualPendingUid: string | null = null
  rankedPendingUid: string | null = null

  constructor(
    private matchService: MatchService,
    @Inject('QueueSocketsService')
    private queueSocketsService: SocketsService<QueueEmitType>,
  ) {}

  async enqueue(uid: string, mode: 'casual' | 'ranked') {
    if (!this.matchService.isAvailable(uid)) return

    if (mode === 'casual') {
      if (!this.casualPendingUid) this.casualPendingUid = uid
      else if (this.casualPendingUid !== uid) {
        const pending = this.casualPendingUid
        this.dequeue(pending)
        this.dequeue(uid)
        // this.createHumanMatch(pending, entry) // Refactor
      }
    } else if (mode === 'ranked') {
      if (!this.rankedPendingUid) this.rankedPendingUid = uid
      else if (this.rankedPendingUid !== uid) {
        const pending = this.rankedPendingUid
        this.dequeue(pending)
        this.dequeue(uid)

        const matchId = await this.matchService.createPvPMatch(pending, uid)

        this.queueSocketsService.emit(pending, 'matchFound', {
          matchId,
          opponentId: uid,
        })
        this.queueSocketsService.emit(uid, 'matchFound', {
          matchId,
          opponentId: pending,
        })
      }
    }
  }

  getQueueModes(uid: string) {
    return {
      casual: this.casualPendingUid === uid,
      ranked: this.rankedPendingUid === uid,
    }
  }

  dequeue(uid: string, mode?: 'casual' | 'ranked') {
    if (!mode) {
      if (this.casualPendingUid === uid) this.casualPendingUid = null
      if (this.rankedPendingUid === uid) this.rankedPendingUid = null
    } else if (mode === 'casual' && this.casualPendingUid === uid)
      this.casualPendingUid = null
    else if (mode === 'ranked' && this.rankedPendingUid === uid)
      this.rankedPendingUid = null
  }

  getUserCount() {
    return {
      casual: this.casualPendingUid ? 1 : 0,
      ranked: this.rankedPendingUid ? 1 : 0,
    }
  }

  async createBotMatch(uid: string, botName: BotName) {
    const matchId = await this.matchService.createPvCMatch(uid, botName)

    this.queueSocketsService.emit(uid, 'matchFound', {
      matchId,
      opponentId: uid,
    })
  }
}
