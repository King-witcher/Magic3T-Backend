export const enum League {
  Provisional = 'provisional',
  Bronze = 'bronze',
  Silver = 'silver',
  Gold = 'gold',
  Diamond = 'diamond',
  Master = 'master',
  Challenger = 'challenger',
}

export type RatingPayload = {
  league: League
  division: Division | null
  points: number | null
  progress: number
}

export type Division = 1 | 2 | 3 | 4
