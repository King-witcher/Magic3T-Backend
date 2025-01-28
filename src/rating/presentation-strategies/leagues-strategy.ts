import { block } from '@/common'
import { ConfigRepository, League, RatingDto, RatingModel } from '@/database'
import { Injectable } from '@nestjs/common'
import { clamp } from 'lodash'
import { PresentationStrategy } from './presentation-strategy'

const leagueIndexes = [
  League.Bronze,
  League.Silver,
  League.Gold,
  League.Diamond,
  League.Master,
]

@Injectable()
export class LeaguesStrategy extends PresentationStrategy {
  constructor(private configRepository: ConfigRepository) {
    super()
  }

  private getC(inflationTimeInDays: number): number {
    return Math.sqrt(
      (350 ** 2 - 40 ** 2) / (inflationTimeInDays * 24 * 60 * 60 * 1000)
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

  private async getQualifyProgress(model: RatingModel): Promise<number> {
    console.log(model)
    const config = await this.configRepository.cachedGetRatingConfig()
    const currentRD = await this.getCurrentRD(model.deviation, model.timestamp)

    const modelDistance = config.max_rd - currentRD
    const totalDistance = config.max_rd - config.rd_threshold
    const progress = clamp(modelDistance / totalDistance, 0, 1)
    return Math.floor(100 * progress)
  }

  private async convertToLeagueSystem(
    score: number
  ): Promise<[League, number | null, number]> {
    const config = await this.configRepository.cachedGetRatingConfig()

    // 0 means the lowest score, and each point is one league wide.

    const normalizedScore =
      (score - config.base_score) / config.league_length + config.base_league

    // Usual values:
    // 0 - Bronze
    // 1 - Silver
    // 2 - Gold
    // 3 - Diamond
    // 4 - Master
    const leagueIndex = clamp(Math.floor(normalizedScore), 0, 4)
    const leagueRemainder = normalizedScore - leagueIndex
    const league = leagueIndexes[leagueIndex]

    const division = block(() => {
      if (league === League.Master) return null

      const divsAbove = Math.floor(leagueRemainder * 4)
      return 4 - divsAbove
    })

    const points = block(() => {
      if (league === League.Master) return Math.floor(400 * leagueRemainder)

      return Math.floor((400 * leagueRemainder) % 100)
    })

    return [league, division, points]
  }

  async getDto(model: RatingModel): Promise<RatingDto> {
    const config = await this.configRepository.cachedGetRatingConfig()

    // The player's deviation is too high to be considered
    const currentRD = await this.getCurrentRD(model.deviation, model.timestamp)
    if (currentRD > config.rd_threshold) {
      const progress = await this.getQualifyProgress(model)
      return {
        league: League.Provisional,
        division: null,
        points: null,
        progress,
      }
    }

    const [league, division, points] = await this.convertToLeagueSystem(
      model.rating
    )

    return {
      league,
      division,
      points,
      progress: 100,
    }
  }

  async convertRatingIntoLp(rating: number): Promise<number> {
    const config = await this.configRepository.cachedGetRatingConfig()

    return Math.round((400 * rating) / config.league_length)
  }
}
