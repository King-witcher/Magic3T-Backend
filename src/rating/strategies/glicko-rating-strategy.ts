import { ConfigRepository } from '@/database'
import { Glicko, UserModel } from '@/database/user/user.model'
import { Injectable } from '@nestjs/common'
import { getInflation, newDeviation, newRating } from '../lib/glicko'
import { RatingStrategy } from './base-rating-strategy'

@Injectable()
export class GlickoRatingStrategy extends RatingStrategy {
  constructor(private readonly configService: ConfigRepository) {
    super()
  }

  async getRatings(
    first: UserModel,
    second: UserModel,
    scoreOfFirst: number
  ): Promise<[Glicko, Glicko]> {
    const config = await this.configService.getRatingConfig()

    const inflation = getInflation(config.rd_inflation_time, config.max_rd)

    const now = new Date()

    return [
      {
        rating: newRating(
          first.glicko,
          second.glicko,
          scoreOfFirst,
          inflation,
          config.max_rd
        ),
        deviation: Math.max(
          config.min_rd,
          newDeviation(first.glicko, second.glicko, inflation, config.max_rd)
        ),
        timestamp: now,
      },
      {
        rating: newRating(
          second.glicko,
          first.glicko,
          1 - scoreOfFirst,
          inflation,
          config.max_rd
        ),
        deviation: Math.max(
          config.min_rd,
          newDeviation(second.glicko, first.glicko, inflation, config.max_rd)
        ),
        timestamp: now,
      },
    ]
  }
}
