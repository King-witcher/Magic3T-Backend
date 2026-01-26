export type UserRowElo = {
  score: number
  matches: number
  k: number
  challenger: boolean
}

export const enum UserRole {
  Player = 'player',
  Creator = 'creator',
  Bot = 'bot',
}

export type UserRow = {
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

  elo: UserRowElo

  stats: {
    wins: number
    draws: number
    defeats: number
  }
}
