import { Division, League, RatingData } from '@magic3t/common-types'
import { Injectable } from '@nestjs/common'
import { clamp } from 'lodash'
import { ConfigRepository } from '@/database'
import { GetNewRatingsParams, GetNewRatingsResult, GetRatingDataParams } from './types'

const leagueIndexes = [League.Bronze, League.Silver, League.Gold, League.Diamond, League.Master]

@Injectable()
export class RatingService {
  constructor(private configRepository: ConfigRepository) {}

  async getNewRatings(params: GetNewRatingsParams): Promise<GetNewRatingsResult> {
    const configResult = await this.configRepository.cachedGetRatingConfig()
    const config = configResult.expect('Rating config not found.')

    const expected1 = this.odds(params.first.rating, params.second.rating)
    const expected2 = 1 - expected1

    const score1 = params.scoreOfFirst
    const score2 = 1 - score1

    const newRating1 = params.first.rating + params.first.k * (score1 - expected1)
    const newRating2 = params.second.rating + params.second.k * (score2 - expected2)

    const newK1 =
      config.final_k_value * config.k_deflation_factor +
      params.first.k * (1 - config.k_deflation_factor)
    const newK2 =
      config.final_k_value * config.k_deflation_factor +
      params.second.k * (1 - config.k_deflation_factor)

    return {
      first: { rating: newRating1, k: newK1 },
      second: { rating: newRating2, k: newK2 },
    }
  }

  odds(winnerRating: number, loserRating: number): number {
    return 1 / (1 + 10 ** ((loserRating - winnerRating) / 400))
  }

  async getRatingData(params: GetRatingDataParams): Promise<RatingData> {
    const progress = params.matches > 5 ? 100 : (params.matches / 5) * 100

    if (progress < 100) {
      return {
        league: League.Provisional,
        division: null,
        points: null,
        progress,
      }
    }

    const rawLP = await this.getTotalLp(params.rating)

    // 0 - Bronze
    // 1 - Silver
    // 2 - Gold
    // 3 - Diamond
    // 4 - Master
    const leagueIndex = clamp(Math.floor(rawLP / 400), 0, 4)
    const league = leagueIndexes[leagueIndex]
    const division = (() => {
      if (league === League.Master) return null

      const divsAbove4 = Math.floor((rawLP % 400) / 100)
      return (4 - divsAbove4) as Division
    })()

    const points = (() => {
      if (league === League.Master) return Math.floor(rawLP - 1600)
      return Math.floor(rawLP % 100)
    })()

    return {
      league,
      division,
      points,
      progress: 100,
    }
  }

  private async getTotalLp(rating: number): Promise<number> {
    const config = (await this.configRepository.cachedGetRatingConfig()).expect(
      'Rating config not found.'
    )
    const rawLP = 400 * ((rating - config.base_score) / config.league_length + config.base_league)
    return Math.round(rawLP)
  }

  async getRawLP(rating: number): Promise<number> {
    const config = (await this.configRepository.cachedGetRatingConfig()).expect(
      'Rating config not found.'
    )
    return Math.round((400 * rating) / config.league_length)
  }
}
