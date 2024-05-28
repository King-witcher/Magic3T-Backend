import { Injectable } from '@nestjs/common'
import { UserModel } from '../database/users/user.model'
import { UsersService } from '../database/users/users.service'
import { ConfigService } from '../database/config/config.service'
import { RatingStrategy } from './strategies/base-rating-strategy'

@Injectable()
export class RatingService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly ratingStrategy: RatingStrategy,
  ) {}

  getRatings(...params: Parameters<RatingStrategy['getRatings']>) {
    return this.ratingStrategy.getRatings(...params)
  }
}
