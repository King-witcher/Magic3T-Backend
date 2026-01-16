import { WithId } from '@magic3t/types'

export type UserRowGlicko = {
  rating: number
  deviation: number
  timestamp: Date
}

export type UserRowElo = {
  score: number
  matches: number
  k: number
}

export const enum UserRole {
  Player = 'player',
  Creator = 'creator',
  Bot = 'bot',
}

export type UserRow = WithId & {
  identification: {
    unique_id: string // slug
    nickname: string
    last_changed: Date
  }

  experience: number
  magic_points: number // bought with money
  perfect_squares: number // earned playing
  summoner_icon: number

  role: UserRole

  glicko: UserRowGlicko // Deprecated
  elo: UserRowElo

  stats: {
    wins: number
    draws: number
    defeats: number
  }
}
