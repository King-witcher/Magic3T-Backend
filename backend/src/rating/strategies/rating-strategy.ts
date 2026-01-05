import { UserRow } from '@magic3t/types'

/** Defines how ratings should be updated based on player scores on a match. */
export abstract class RatingStrategy {
  /**
   * Gets the current rating progress of the user, from 0 to 100.
   * @param user The user to get the rating progress for.
   */
  abstract getRatingProgress(user: UserRow): Promise<number>

  /**
   * Update the players based on the score of the first and returns the variations.
   */
  abstract update(a: UserRow, b: UserRow, aScore: number): Promise<void>

  /**
   * Gets a raw integer number representing how many LP the player has.
   */
  abstract getTotalLp(user: UserRow): Promise<number>
}
