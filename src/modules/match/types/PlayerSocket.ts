import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { Match } from '../lib/Match'
import { Player } from '../lib/Player'

export type PlayerSocketData = {
  match: Match
  player: Player
}

export type PlayerSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, PlayerSocketData>
