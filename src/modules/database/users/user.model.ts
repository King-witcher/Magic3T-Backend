import { WithId } from '@modules/database/types/withId'

export interface Glicko {
  rating: number
  deviation: number
  timestamp: Date
}

export interface UserModel extends WithId {
  nickname: string
  role: 'player' | 'bot' | 'creator'
  glicko: Glicko
  stats: {
    wins: number
    draws: number
    defeats: number
  }
}
