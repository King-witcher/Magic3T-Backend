import { MatchFoundCallback, Queue } from './Queue'
import { QueueEntry } from './QueueEntry'

export class SimpleQueue extends Queue {
  private pendingPlayer: QueueEntry | null = null

  constructor(onFindMatch: MatchFoundCallback) {
    super(onFindMatch)
  }

  enqueue(entry: QueueEntry) {
    if (this.pendingPlayer?.user.uid === entry.user.uid) return

    if (!this.pendingPlayer) this.pendingPlayer = entry
    else {
      const pending = this.pendingPlayer
      this.pendingPlayer = null
      this.onFindMatch(pending, entry)
    }
  }

  contains(uid: string) {
    return this.pendingPlayer?.user.uid === uid
  }

  dequeue(uid: string) {
    if (this.pendingPlayer?.user.uid === uid) this.pendingPlayer = null
  }
}
