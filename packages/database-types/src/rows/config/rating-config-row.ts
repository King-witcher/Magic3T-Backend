export interface RatingConfigRow {
  /** The base rating in the game, which is assigned to every player at the beginning. */
  initial_elo: number

  /** The length of each league in elo points. */
  elo_per_league: number

  /** The league where a player would be with the base score. This number can be fractionary. */
  initial_league_index: number

  /** The lowest possible K value for elo system. */
  least_k_factor: number

  /** The initial user K value for elo system. */
  initial_k_factor: number

  /** The factor by which the K value is deflated towards the final K value after each match. */
  k_deflation_factor: number
}
