import { ConfigRepository } from '@/database'
import { Injectable } from '@nestjs/common'
import { getInflation, newDeviation, newRating } from './glicko'
import { RatingStrategy } from './rating-strategy'
import { UserModel } from '@magic3t/types'

const DEFAULT_MAX_RD = 350
const DEFAULT_MIN_RD = 40

@Injectable()
export class GlickoStrategy extends RatingStrategy {
  constructor(private configRepository: ConfigRepository) {
    super()
  }

  async update(a: UserModel, b: UserModel, aScore: number) {
    const config = await this.configRepository.cachedGetRatingConfig()

    const inflation = getInflation(config.rd_inflation_time, config.max_rd)

    const now = new Date()

    a.glicko = {
      rating: newRating(a.glicko, b.glicko, aScore, inflation, config.max_rd),
      deviation: Math.max(
        config.min_rd,
        newDeviation(a.glicko, b.glicko, inflation, config.max_rd)
      ),
      timestamp: now,
    }

    b.glicko = {
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
    }
  }

  async getTotalLp(user: UserModel): Promise<number> {
    if (!user.glicko) throw new Error('User does not have a Glicko rating.')

    const config = await this.configRepository.cachedGetRatingConfig()
    const rawLP = Math.round(
      400 *
        ((user.glicko.rating - config.base_score) / config.league_length +
          config.base_league)
    )
    return rawLP
  }

  async getRatingProgress(user: UserModel): Promise<number> {
    if (!user.glicko) return 0
    const config = await this.configRepository.cachedGetRatingConfig()

    const currentRD = await this.getCurrentRD(
      user.glicko.deviation,
      user.glicko.timestamp
    )

    if (currentRD <= config.rd_threshold) return 100
    return (
      ((config.max_rd - currentRD) / (config.max_rd - config.rd_threshold)) *
      100
    )
  }

  private getC(inflationTimeInDays: number): number {
    const ONE_DAY = 24 * 60 * 60 * 1000 // milliseconds in one day
    return Math.sqrt(
      (DEFAULT_MAX_RD ** 2 - DEFAULT_MIN_RD ** 2) /
        (inflationTimeInDays * ONE_DAY)
    )
  }

  /** Gets the current RD based on the stored RD and its age. */
  private async getCurrentRD(rd: number, date: Date): Promise<number> {
    const config = await this.configRepository.cachedGetRatingConfig()

    const t = Date.now() - date.getTime()
    const c = this.getC(config.rd_inflation_time)
    const candidate = Math.sqrt(rd ** 2 + c ** 2 * t)
    return Math.min(candidate, config.max_rd)
  }
}
