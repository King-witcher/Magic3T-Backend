import { Inject, Injectable } from '@nestjs/common'
import { MatchService } from '../match/match.service'
import { SocketsService } from '../sockets.service'
import { QueueEmitType } from './types/QueueSocket'
import { ConfigService } from '@modules/database/config/config.service'
import { BotNames } from '@modules/database/config/bot-config.model'
import { UsersService } from '@modules/database/users/users.service'
import { MatchSocketEmitMap } from '@modules/match/types/MatchSocket'

// const botConfig = database.doc('config/bots').get()
const BOT_TIMELIMIT = 1000 * 60 * 3

@Injectable()
export class QueueService {
  casualPendingUid: string | null = null
  rankedPendingUid: string | null = null

  constructor(
    private matchService: MatchService,
    @Inject('QueueSocketsService')
    private queueSocketsService: SocketsService<QueueEmitType>,
    @Inject('MatchSocketsService')
    private matchSocketsService: SocketsService<MatchSocketEmitMap>,
    private configService: ConfigService,
    private userService: UsersService,
  ) {}

  enqueue(uid: string, mode: 'casual' | 'ranked') {
    if (!this.matchService.isAvailable(uid)) return

    if (mode === 'casual') {
      if (!this.casualPendingUid) this.casualPendingUid = uid
      else if (this.casualPendingUid !== uid) {
        const pending = this.casualPendingUid
        this.dequeue(pending)
        this.dequeue(uid)
        //this.createHumanMatch(pending, entry)
      }
    } else if (mode === 'ranked') {
      if (!this.rankedPendingUid) this.rankedPendingUid = uid
      else if (this.rankedPendingUid !== uid) {
        const pending = this.rankedPendingUid
        this.dequeue(pending)
        this.dequeue(uid)
        //this.createHumanMatch(pending, entry, true)
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

  async createBotMatch(uid: string, botName: BotNames) {
    const matchId = await this.matchService.createPvCMatch(uid, botName)

    this.queueSocketsService.emit(uid, 'matchFound', {
      matchId,
      oponentId: uid,
    })
  }
}
