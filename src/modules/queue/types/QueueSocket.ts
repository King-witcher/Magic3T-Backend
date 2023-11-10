import { Server, Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { GamePlayerProfile } from './GamePlayerProfile'

export type QueueSocketData = {
  user: GamePlayerProfile
}

export type EmitEvents = {
  queueRejected: (reason?: string) => void
  queueAcepted: (payload: { mode: 'casual' | 'ranked' }) => void
  queueModes: (payload: { casual: boolean; ranked: boolean }) => void
  matchFound: (data: { matchId: string }) => void
  updateUserCount: (data: {
    connected: number
    casual: { queue: number; inGame: number }
    ranked: { queue: number; inGame: number }
  }) => void
}

export type QueueSocket = Socket<DefaultEventsMap, EmitEvents, DefaultEventsMap, QueueSocketData>
export type QueueServer = Server<DefaultEventsMap, EmitEvents, DefaultEventsMap, QueueSocketData>
