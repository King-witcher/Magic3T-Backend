import { ConfigRepository } from '@/database'
import { RatingModel, UserModel } from '@/database/user/user.model'
import { Injectable } from '@nestjs/common'
import { getInflation, newDeviation, newRating } from '../lib/glicko'
import { UpdatingStrategy } from './updating-strategy'

@Injectable()
export class GlickoStrategy extends UpdatingStrategy {
  constructor(private readonly configService: ConfigRepository) {
    super()
  }

  async getNewRatings(
    a: UserModel,
    b: UserModel,
    aScore: number
  ): Promise<[RatingModel, RatingModel]> {
    const config = await this.configService.getRatingConfig()

    const inflation = getInflation(config.rd_inflation_time, config.max_rd)

    const now = new Date()

    return [
      {
        rating: newRating(a.glicko, b.glicko, aScore, inflation, config.max_rd),
        deviation: Math.max(
          config.min_rd,
          newDeviation(a.glicko, b.glicko, inflation, config.max_rd)
        ),
        timestamp: now,
      },
      {
        rating: newRating(
          b.glicko,
          a.glicko,
          1 - aScore,
          inflation,
          config.max_rd
        ),
        deviation: Math.max(
          config.min_rd,
          newDeviation(b.glicko, a.glicko, inflation, config.max_rd)
        ),
        timestamp: now,
      },
    ]
  }
}
