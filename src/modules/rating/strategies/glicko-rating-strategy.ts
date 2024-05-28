import { Glicko, UserModel } from '@/modules/database/users/user.model'
import { RatingStrategy } from './base-rating-strategy'
import { ConfigService } from '@/modules/database/config/config.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class GlickoRatingStrategy extends RatingStrategy {
  constructor(private readonly configService: ConfigService) {
    super()
  }

  async getRatings(
    first: UserModel,
    second: UserModel,
    scoreOfFirst: number,
  ): Promise<[Glicko, Glicko]> {
    console.log('worked')
    const config = await this.configService.getRatingConfig()

    return [first.glicko, second.glicko]
  }
}
