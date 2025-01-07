import { WithId } from '@/database/types/withId'

// TODO: Change to rating, and replace rating with score
export interface RatingModel {
  rating: number
  deviation: number
  timestamp: Date
}

export interface UserModel extends WithId {
  identification: {
    unique_id: string // nickname.toLower() without spaces
    nickname: string
    last_changed: Date
  } | null

  experience: number
  magic_points: number // bought with money
  perfect_squares: number // earned playing
  summoner_icon: number

  role: UserRole

  glicko: RatingModel

  stats: {
    wins: number
    draws: number
    defeats: number
  }
}

export enum UserRole {
  Player = 'player',
  Creator = 'creator',
  Bot = 'bot',
}
