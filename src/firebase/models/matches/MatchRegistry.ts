import { Choice } from '@/modules/game/match/types/Choice'
import { WithId } from '../types/WithId'

export interface Player {
  uid: string
  name: string
  rating: number
  rv: number
}

export interface Move {
  player: 'white' | 'black'
  move: Choice | 'forfeit' | 'timeout'
  time: number
}

/** Represents a match registry in the History. */
export interface MatchRegistry extends WithId {
  white: Player
  black: Player
  moves: Move[]
  winner: 'white' | 'black' | 'none'
  mode: 'casual' | 'ranked'
  timestamp: Date
}
