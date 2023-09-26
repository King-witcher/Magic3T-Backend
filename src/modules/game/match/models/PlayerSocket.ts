import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { Match } from './Match'
import { PlayerHandler } from './Player'

export type PlayerSocketData = {
  match: Match
  player: PlayerHandler
}

export type PlayerSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  PlayerSocketData
>
