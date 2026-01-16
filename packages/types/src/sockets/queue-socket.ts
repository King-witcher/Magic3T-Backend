export const enum QueueServerEvents {
  QueueRejected = 'queueRejected',
  QueueAccepted = 'queueAccepted',
  QueueModes = 'queueModes',
  MatchFound = 'matchFound',
  UserCount = 'userCount',
}

export const enum QueueClientEvents {
  Interact = 'interact',
  Fair = 'fair',
  Bot0 = 'bot-0',
  Bot1 = 'bot-1',
  Bot2 = 'bot-2',
  Bot3 = 'bot-3',
  Casual = 'casual',
  Ranked = 'ranked',
  Dequeue = 'dequeue',
}

export type UpdateUserCountPayload = {
  connected: number
  casual: { queue: number; inGame: number }
  ranked: { queue: number; inGame: number }
}

export interface QueueServerEventsMap {
  [QueueServerEvents.QueueRejected](reason?: string): void
  [QueueServerEvents.QueueAccepted](payload: {
    mode: 'casual' | 'ranked'
  }): void
  [QueueServerEvents.QueueModes](payload: {
    casual: boolean
    ranked: boolean
  }): void
  [QueueServerEvents.MatchFound](data: {
    matchId: string
    opponentId: string
  }): void
  [QueueServerEvents.UserCount](data: UpdateUserCountPayload): void
}

export interface QueueClientEventsMap {
  [QueueClientEvents.Interact](): void
  [QueueClientEvents.Fair](): void
  [QueueClientEvents.Bot0](): void
  [QueueClientEvents.Bot1](): void
  [QueueClientEvents.Bot2](): void
  [QueueClientEvents.Bot3](): void
  [QueueClientEvents.Casual](): void
  [QueueClientEvents.Ranked](): void
  [QueueClientEvents.Dequeue](): void
}
