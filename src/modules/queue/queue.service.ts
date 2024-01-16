import { Injectable } from '@nestjs/common'
import { QueueEntry } from './types/QueueEntry'
import { MatchService } from '../match/match.service'
import { SocketsService } from '../sockets.service'
import { QueueEmitType } from './types/QueueSocket'
import { GamePlayerProfile } from './types/GamePlayerProfile'
import { database } from '@/firebase/services'
import { models } from '@/firebase/models'
import { RandomBot } from '@/lib/bots/RandomBot'
import { LMMBot } from '@/lib/bots/LMMBot'

const botConfig = database.doc('config/bots').get()
const BOT_TIMELIMIT = 1000 * 60 * 3

@Injectable()
export class QueueService {
  casualPendingEntry: QueueEntry | null = null
  rankedPendingEntry: QueueEntry | null = null

  constructor(
    private matchService: MatchService,
    private socketsService: SocketsService<QueueEmitType>,
  ) {}

  isAvailable(uid: string) {
    return !(
      this.casualPendingEntry?.user.uid === uid ||
      this.rankedPendingEntry?.user.uid === uid
    )
  }

  enqueue(entry: QueueEntry, mode: 'casual' | 'ranked') {
    if (!this.matchService.isAvailable(entry.user.uid)) return

    if (mode === 'casual') {
      if (!this.casualPendingEntry) this.casualPendingEntry = entry
      else if (this.casualPendingEntry.user.uid !== entry.user.uid) {
        const pending = this.casualPendingEntry
        this.dequeue(pending.user.uid)
        this.dequeue(entry.user.uid)
        this.createMatch(pending, entry)
      }
    } else if (mode === 'ranked') {
      if (!this.rankedPendingEntry) this.rankedPendingEntry = entry
      else if (this.rankedPendingEntry.user.uid !== entry.user.uid) {
        const pending = this.rankedPendingEntry
        this.dequeue(pending.user.uid)
        this.dequeue(entry.user.uid)
        this.createMatch(pending, entry, true)
      }
    }
  }

  getQueueModes(uid: string) {
    return {
      casual: this.casualPendingEntry?.user.uid === uid,
      ranked: this.rankedPendingEntry?.user.uid === uid,
    }
  }

  dequeue(uid: string, mode?: 'casual' | 'ranked') {
    if (!mode) {
      if (this.casualPendingEntry?.user.uid === uid)
        this.casualPendingEntry = null
      if (this.rankedPendingEntry?.user.uid === uid)
        this.rankedPendingEntry = null
    } else if (mode === 'casual' && this.casualPendingEntry?.user.uid === uid)
      this.casualPendingEntry = null
    else if (mode === 'ranked' && this.rankedPendingEntry?.user.uid === uid)
      this.rankedPendingEntry = null
  }

  getUserCount() {
    return {
      casual: this.casualPendingEntry ? 1 : 0,
      ranked: this.rankedPendingEntry ? 1 : 0,
    }
  }

  async createMatchVsCPU(user: GamePlayerProfile, botName: string) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(
        `Player "${user.name}" unavailable for queue: already in game.`,
      )
      this.socketsService.emit(user.uid, 'queueRejected')
      return
    }

    // Get the bot specific config
    const configSnapshot = await botConfig
    const configs = configSnapshot.data()
    if (!configs) return
    const config = configs[botName]
    const { glicko, nickname, _id } = await models.users.getById(config.uid)

    const botProfile: GamePlayerProfile = {
      glicko,
      name: nickname,
      uid: _id,
      isAnonymous: false,
    }

    // Create a match
    const botSide = Math.random() < 0.5 ? 'white' : 'black'
    const match = this.matchService.createMatch({
      white: botSide === 'black' ? user : botProfile,
      black: botSide === 'black' ? botProfile : user,
      config: {
        isRanked: true,
        readyTimeout: 2000,
        timelimit: BOT_TIMELIMIT,
      },
    })

    // Create and inject the bot into the match
    const bot =
      config.model === 'random'
        ? new RandomBot(match[botSide])
        : new LMMBot(match[botSide], config.depth)

    match[botSide].channel = bot.getChannel()
    match[botSide].onReady()

    this.socketsService.emit(user.uid, 'matchFound', {
      matchId: match.id,
      oponentId: match.playerMap[user.uid].oponent.profile.uid,
    })
  }

  createMatch(entry1: QueueEntry, entry2: QueueEntry, ranked?: boolean) {
    const rnd = Math.random() < 0.5

    const match = this.matchService.createMatch({
      white: rnd ? entry1.user : entry2.user,
      black: rnd ? entry2.user : entry1.user,
      config: {
        isRanked: ranked || false,
        readyTimeout: 1000 * 5,
        timelimit: 1000 * 105,
      },
    })

    this.socketsService.emit(entry1.user.uid, 'matchFound', {
      matchId: match.id,
      oponentId: entry2.user.uid,
    })

    this.socketsService.emit(entry2.user.uid, 'matchFound', {
      matchId: match.id,
      oponentId: entry1.user.uid,
    })
  }
}
