import type { UserRole } from '../../database'
import type { RatingPayload } from './rating'

export type UserPayload = {
  id: string
  nickname: string
  summonerIcon: number
  role: UserRole
  rating: RatingPayload
  stats: {
    wins: number
    draws: number
    defeats: number
  }
}
