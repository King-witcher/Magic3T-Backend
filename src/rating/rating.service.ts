import { ConfigRepository } from '@/database'
import { Division, League, RatingPayload, UserRow } from '@magic3t/types'
import { Injectable } from '@nestjs/common'
import { clamp } from 'lodash'
import { RatingStrategy } from './strategies'

const leagueIndexes = [
  League.Bronze,
  League.Silver,
  League.Gold,
  League.Diamond,
  League.Master,
]

@Injectable()
export class RatingService {
  constructor(
    private configRepository: ConfigRepository,
    private ratingStrategy: RatingStrategy
  ) {}

  update(...params: Parameters<RatingStrategy['update']>) {
    return this.ratingStrategy.update(...params)
  }

  async getRating(userModel: UserRow): Promise<RatingPayload> {
    const progress = await this.ratingStrategy.getRatingProgress(userModel)
    if (progress < 100) {
      return {
        league: League.Provisional,
        division: null,
        points: null,
        progress,
      }
    }

    const rawLP = await this.ratingStrategy.getTotalLp(userModel)

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

  async convertRatingIntoLp(rating: number): Promise<number> {
    const config = (
      await this.configRepository.cachedGetRatingConfig()
    ).unwrap()
    return Math.round((400 * rating) / config.league_length)
  }

  async getTotalLp(userModel: UserRow): Promise<number> {
    return this.ratingStrategy.getTotalLp(userModel)
  }
}
