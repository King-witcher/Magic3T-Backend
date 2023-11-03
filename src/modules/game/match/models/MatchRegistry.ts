import { PlayerMove } from './PlayerMove'

interface Player {
  uid: string
  name: string
  rating: number
  rv: number
}

export interface MatchRegistry {
  white: Player
  black: Player
  moves: PlayerMove[]
  winner: 'white' | 'black' | 'none'
  mode: 'casual' | 'ranked'
  timestamp: Date
}