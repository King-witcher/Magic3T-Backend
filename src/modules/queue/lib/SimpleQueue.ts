import { MatchFoundCallback, Queue } from './Queue'
import { QueueEntry } from '../types/QueueEntry'

export class SimpleQueue extends Queue {
  private pendingEntry: QueueEntry | null = null

  constructor(onFindMatch: MatchFoundCallback) {
    super(onFindMatch)
  }

  isAvailable(uid: string): boolean {
    return this.pendingEntry?.user.uid !== uid
  }

  enqueue(entry: QueueEntry) {
    if (this.pendingEntry?.user.uid === entry.user.uid) return

    if (!this.pendingEntry) this.pendingEntry = entry
    else {
      const pending = this.pendingEntry
      this.pendingEntry = null
      this.onFindMatch(pending, entry)
    }
  }

  contains(uid: string) {
    return this.pendingEntry?.user.uid === uid
  }

  dequeue(uid: string) {
    if (this.pendingEntry?.user.uid === uid) this.pendingEntry = null
  }
}
