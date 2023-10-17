import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { PlayerData } from './PlayerData'

export type QueueSocketData = {
  user: PlayerData
}

export type QueueSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  QueueSocketData
>
