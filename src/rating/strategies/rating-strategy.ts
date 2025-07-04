import { UserModel } from '@/database/user/user.model'

/** Defines how ratings should be updated based on player scores on a match. */
export abstract class RatingStrategy {
  /**
   * Gets the current rating progress of the user, from 0 to 100.
   * @param user The user to get the rating progress for.
   */
  abstract getRatingProgress(user: UserModel): Promise<number>

  /**
   * Update the players based on the score of the first and returns the variations.
   */
  abstract update(a: UserModel, b: UserModel, aScore: number): Promise<void>

  /**
   * Gets a raw integer number representing how many LP the player has.
   */
  abstract getTotalLp(user: UserModel): Promise<number>
}
