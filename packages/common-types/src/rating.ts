export const enum League {
  Provisional = 'provisional',
  Bronze = 'bronze',
  Silver = 'silver',
  Gold = 'gold',
  Diamond = 'diamond',
  Master = 'master',
  Challenger = 'challenger',
}

export type Division = 1 | 2 | 3 | 4

/**
 * Represents the rating data of a user from the client's perspective.
 */
export type RatingData = {
  league: League
  division: Division | null
  points: number | null
  progress: number
}
