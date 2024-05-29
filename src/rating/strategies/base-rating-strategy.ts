import { Glicko, UserModel } from '@/database/users/user.model'

export abstract class RatingStrategy {
  abstract getRatings(
    first: UserModel,
    second: UserModel,
    scoreOfFirst: number,
  ): Promise<[Glicko, Glicko]>
}
