import { WithId } from '@/database/types/withId'

// TODO: Change to rating, and replace rating with score
export interface Glicko {
  rating: number
  deviation: number
  timestamp: Date
}

export interface UserModel extends WithId {
  nickname: string
  nicknameDate?: Date
  role: 'player' | 'bot' | 'creator'
  glicko: Glicko
  stats: {
    wins: number
    draws: number
    defeats: number
  }
}
