import { Division, League, RatingData } from '@magic3t/common-types'
import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { clamp } from 'lodash'
import { ConfigRepository, UserRepository } from '@/database'
import { GetNewRatingsParams, GetNewRatingsResult, GetRatingDataParams } from './types'
import { RatingConverter } from './rating-object'

const leagueIndexes = [League.Bronze, League.Silver, League.Gold, League.Diamond, League.Master]
const MAX_CHALLENGERS = 1

@Injectable()
export class RatingService {
  private logger = new Logger(RatingService.name)

  constructor(
    private configRepository: ConfigRepository,
    private usersRepository: UserRepository
  ) {}

  @Cron('0 0 12 * * *')
  async updateChallenger() {
    this.logger.log('Updating Challengers')
    const config = (await this.configRepository.cachedGetRatingConfig()).expect('failed to get config')
    const bestPlayers = await this.usersRepository.listBestPlayers(5, MAX_CHALLENGERS)

    const challengers = bestPlayers.filter((user) => {
      const ratingConverter = new RatingConverter(user.data.elo, config)
      return ratingConverter.isChallengerEligible
    })

    await this.usersRepository.setOrReplaceChallengers(challengers.map(c => c.id))
    this.logger.log(`Updated Challengers: ${challengers.map(c => c.id).join(', ')}`)
  }

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

    const resultFirst: GetNewRatingsResult['first'] = {
      rating: newRating1,
      k: newK1,
      challenger: params.first.challenger,
    }

    const resultSecond: GetNewRatingsResult['second'] = {
      rating: newRating2,
      k: newK2,
      challenger: params.second.challenger,
    }

    // Workaround to remove challenger flag if players fall below diamond
    if (params.first.challenger) {
      const lp = await this.getTotalLp(newRating1)
      if (lp < 4 * 400) resultFirst.challenger = false
    }

    if (params.second.challenger) {
      const lp = await this.getTotalLp(newRating2)
      if (lp < 4 * 400) resultSecond.challenger = false
    }

    return {
      first: resultFirst,
      second: resultSecond,
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
    const league = params.challenger ? League.Challenger : leagueIndexes[leagueIndex]
    const division = (() => {
      if (league === League.Master || league === League.Challenger) return null

      const divsAbove4 = Math.floor((rawLP % 400) / 100)
      return (4 - divsAbove4) as Division
    })()

    const points = (() => {
      if (league === League.Master || league === League.Challenger) return Math.floor(rawLP - 1600)
      return Math.floor(rawLP % 100)
    })()

    return {
      league,
      division,
      points,
      progress: 100,
    }
  }

  /** Gets how much LP the player has relative to the lowest League */
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
