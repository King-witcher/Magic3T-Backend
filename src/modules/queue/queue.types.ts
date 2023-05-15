export enum QueueStatus {
  Searching = 'enqueued',
  Matched = 'matched',
}

export interface BaseQueueEntry {
  queueTime: number
  lastQueueCheck: number
  queueStatus: QueueStatus
  matchTime: number | null
  gameId: string | null
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
