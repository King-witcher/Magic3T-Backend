export enum QueueStatus {
  Searching = 'searching',
  Matched = 'matched',
}

export interface BaseQueueEntry {
  queueTime: number
  lastQueueCheck: number
  queueStatus: QueueStatus
  matchTime: number | null
  playerId: string | null
}

export interface SignedQueueEntry extends BaseQueueEntry {
  profile: {
    id: number
    rating: number
  }
}

export interface AnonymousQueueEntry extends BaseQueueEntry {
  profile: null
}

export type QueueEntry = SignedQueueEntry | AnonymousQueueEntry
