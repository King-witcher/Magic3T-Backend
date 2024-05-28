import { Glicko, UserModel } from '@/modules/database/users/user.model'

export abstract class RatingStrategy {
  abstract getRatings(
    first: UserModel,
    second: UserModel,
    scoreOfFirst: number,
  ): Promise<[Glicko, Glicko]>
}
