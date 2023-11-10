import { QueueEntry } from '../types/QueueEntry'

export type MatchFoundCallback = (player1: QueueEntry, player2: QueueEntry) => void

export abstract class Queue {
  constructor(protected onFindMatch: MatchFoundCallback) {}

  abstract isAvailable(uid: string): boolean
  abstract enqueue(entry: QueueEntry): void
  abstract dequeue(uid: string): void
  abstract contains(uid: string): boolean
}
