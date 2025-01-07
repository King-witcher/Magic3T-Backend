import { RatingModel, UserModel } from '@/database/user/user.model'

/** Defines how ratings should be updated based on player scores on a match. */
export abstract class UpdatingStrategy {
  abstract getNewRatings(
    a: UserModel,
    b: UserModel,
    aScore: number
  ): Promise<[RatingModel, RatingModel]>
}
