import { WithId } from '@/firebase/models/types/WithId'

export interface Glicko {
  rating: number
  deviation: number
  timestamp: Date
}

export interface User extends WithId {
  nickname: string
  role: 'player' | 'bot' | 'creator'
  glicko: Glicko
  stats: {
    wins: number
    draws: number
    defeats: number
  }
}
