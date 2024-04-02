import { Choice } from '@/types/Choice'
import { WithId } from '@modules/database/types/withId'

export interface MatchPlayer {
  uid: string
  name: string
  rating: number
  rv: number
}

export interface Movement {
  player: 'white' | 'black'
  move: Choice | 'forfeit' | 'timeout'
  time: number
}

/** Represents a match registry in the History. */
export interface MatchModel extends WithId {
  white: MatchPlayer
  black: MatchPlayer
  moves: Movement[]
  winner: 'white' | 'black' | 'none'
  mode: 'casual' | 'ranked'
  timestamp: Date
}
