import { RatingModel, UserModel } from '@/database/user/user.model'

/** Defines how ratings should be updated based on player scores on a match. */
export abstract class UpdatingStrategy {
  /**
   * Gets the new ratings of two players based on the score on their previous ratings after a match with a given scoore
   * for the first.
   */
  abstract getNewRatings(
    a: UserModel,
    b: UserModel,
    aScore: number
  ): Promise<[RatingModel, RatingModel]>
}
