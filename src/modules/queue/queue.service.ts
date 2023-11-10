import { Injectable } from '@nestjs/common'
import { QueueEntry } from './types/QueueEntry'
import { MatchService } from '../match/match.service'

@Injectable()
export class QueueService {
  casualPendingEntry: QueueEntry | null = null
  rankedPendingEntry: QueueEntry | null = null

  constructor(private matchService: MatchService) {}

  isAvailable(uid: string) {
    return !(this.casualPendingEntry?.user.uid === uid || this.rankedPendingEntry?.user.uid === uid)
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
      if (this.casualPendingEntry?.user.uid === uid) this.casualPendingEntry = null
      if (this.rankedPendingEntry?.user.uid === uid) this.rankedPendingEntry = null
    } else if (mode === 'casual' && this.casualPendingEntry?.user.uid === uid) this.casualPendingEntry = null
    else if (mode === 'ranked' && this.rankedPendingEntry?.user.uid === uid) this.rankedPendingEntry = null
  }

  createMatch(entry1: QueueEntry, entry2: QueueEntry, ranked?: boolean) {
    const match = this.matchService.createMatch({
      white: entry1.user,
      black: entry2.user,
      config: {
        isRanked: ranked || false,
        readyTimeout: 2000,
        timelimit: 1000 * 105,
      },
    })
    entry1.socket.emit('matchFound', {
      matchId: match.id,
    })
    entry2.socket.emit('matchFound', {
      matchId: match.id,
    })
  }
}
