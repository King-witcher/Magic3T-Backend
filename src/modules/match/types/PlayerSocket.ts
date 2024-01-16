import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { Match } from '../lib/Match'
import { Player } from '../lib/Player'

export type PlayerSocketData = {
  match: Match
  player: Player
}

export type PlayerEmitType = {
  message(message: string)
  oponentUid(uid: string)
  gameState(state: string)
  ratingsVariation(data: { player: number; oponent: number })
}

export type PlayerSocket = Socket<
  DefaultEventsMap,
  PlayerEmitType,
  DefaultEventsMap,
  PlayerSocketData
>
