import type { WithId } from './with-id'

export interface Glicko {
  rating: number
  deviation: number
  timestamp: Date
}

export interface Elo {
  score: number
  matches: number
  k: number
}

export const enum UserRole {
  Player = 'player',
  Creator = 'creator',
  Bot = 'bot',
}

export interface UserRow extends WithId {
  identification: {
    unique_id: string // nickname.toLower() without spaces
    nickname: string
    last_changed: Date
  }

  experience: number
  magic_points: number // bought with money
  perfect_squares: number // earned playing
  summoner_icon: number

  role: UserRole

  glicko: Glicko
  elo: Elo

  stats: {
    wins: number
    draws: number
    defeats: number
  }
}

export interface IconAssignmentRow extends WithId {
  date: Date
}
