import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { GamePlayerProfile } from './GamePlayerProfile'

export type QueueSocketData = {
  user: GamePlayerProfile
}

export type QueueSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, QueueSocketData>
