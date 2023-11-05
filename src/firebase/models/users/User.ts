import { WithId } from '@/firebase/models/types/WithId'

export interface Glicko {
  rating: number
  deviation: number
  timestamp: Date
}

export interface User extends WithId {
  nickname: string
  role: 'admin' | 'player'
  glicko: Glicko
}
