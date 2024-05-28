import { Server, Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

export type QueueSocketData = {
  uid: string
}

export type QueueEmitType = {
  queueRejected: (reason?: string) => void
  queueAcepted: (payload: { mode: 'casual' | 'ranked' }) => void
  queueModes: (payload: { casual: boolean; ranked: boolean }) => void
  matchFound(data: { matchId: string; oponentId: string })
  updateUserCount: (data: {
    connected: number
    casual: { queue: number; inGame: number }
    ranked: { queue: number; inGame: number }
  }) => void
}

export type QueueSocket = Socket<
  DefaultEventsMap,
  QueueEmitType,
  DefaultEventsMap,
  QueueSocketData
>
export type QueueServer = Server<
  DefaultEventsMap,
  QueueEmitType,
  DefaultEventsMap,
  QueueSocketData
>
