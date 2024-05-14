import { Choice } from '@/types/Choice'
import { WithId } from '@modules/database/types/withId'

/** @deprecated */
export interface Player {
  uid: string
  name: string
  rating: number
  rv: number
}

/** @deprecated */
export interface Move {
  player: 'white' | 'black'
  move: Choice | 'forfeit' | 'timeout'
  time: number
}

/** Represents a match registry in the History.
 * @deprecated */
export interface MatchRegistry extends WithId {
  white: Player
  black: Player
  moves: Move[]
  winner: 'white' | 'black' | 'none'
  mode: 'casual' | 'ranked'
  timestamp: Date
}
