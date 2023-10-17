import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { PlayerProfile } from './PlayerProfile'

export type QueueSocketData = {
  user: PlayerProfile
}

export type QueueSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  QueueSocketData
>
