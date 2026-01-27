import { Division, League, RatingData } from '@magic3t/common-types'
import { Injectable, Logger, Scope } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { clamp } from 'lodash'
import { ConfigRepository, UserRepository } from '@/database'
import { GetNewRatingsParams, GetNewRatingsResult, GetRatingDataParams } from './types'
import { RatingConverter } from './rating-converter'
import { RatingConfigModel } from '@magic3t/types'
import { UserRowElo } from '@magic3t/database-types'

const leagueIndexes = [League.Bronze, League.Silver, League.Gold, League.Diamond, League.Master]
const MAX_CHALLENGERS = 1

@Injectable()
export class RatingService {
  private logger = new Logger(RatingService.name)

  constructor(
    private configRepository: ConfigRepository,
    private usersRepository: UserRepository
  ) {}

  private get ratingConfig(): Promise<RatingConfigModel> {
    return this.configRepository.cachedGetRatingConfig()
  }


  @Cron('0 12 * * *')
  async updateChallengers() {
    this.logger.log('Updating Challengers')
    const config = await this.ratingConfig
    const bestPlayers = await this.usersRepository.listBestPlayers(5, MAX_CHALLENGERS)

    const challengers = bestPlayers.filter((user) => {
      const rating = new RatingConverter(user.data.elo, config)
      return rating.isChallengerEligible
    })

    await this.usersRepository.setOrReplaceChallengers(challengers.map(c => c.id))
    this.logger.log(`Updated Challengers: ${challengers.map(c => c.data.identification.unique_id).join(', ')}`)
  }

  /**
   * Gets the rating covnerter, which provides detailed rating information and utility methods with up to date config.
   */
  async getRatingConverter(elo: UserRowElo): Promise<RatingConverter> {
    const config = await this.ratingConfig
    const rating = new RatingConverter(elo, config)
    return rating
  }

  async getRawLP(rating: number): Promise<number> {
    const config = await this.ratingConfig
    return Math.round((400 * rating) / config.league_length)
  }
}
