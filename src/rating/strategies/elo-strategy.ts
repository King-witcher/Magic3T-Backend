import { ConfigRepository } from '@/database'
import { UserModel } from '@/database/user/user.model'
import { Injectable } from '@nestjs/common'
import { RatingStrategy } from './rating-strategy'

@Injectable()
export class EloStrategy extends RatingStrategy {
  constructor(private configRepository: ConfigRepository) {
    super()
  }

  async update(a: UserModel, b: UserModel, aScore: number): Promise<void> {
    if (!a.elo || !b.elo)
      throw new Error('Both players must have an Elo rating to update.')
    const config = await this.configRepository.cachedGetRatingConfig()

    const expectedA = odds(a.elo.score, b.elo.score)

    a.elo = {
      score: a.elo.score + a.elo.k * (aScore - expectedA),
      matches: a.elo.matches + 1,
      k:
        config.final_k_value * config.k_deflation_factor +
        a.elo.k * (1 - config.k_deflation_factor),
    }

    b.elo = {
      score: b.elo.score + b.elo.k * (1 - aScore - (1 - expectedA)),
      matches: b.elo.matches + 1,
      k:
        config.final_k_value * config.k_deflation_factor +
        b.elo.k * (1 - config.k_deflation_factor),
    }
  }

  async getTotalLp(user: UserModel): Promise<number> {
    if (!user.elo) throw new Error('User does not have an Elo rating.')
    const config = await this.configRepository.cachedGetRatingConfig()
    const rawLP =
      400 *
      ((user.elo.score - config.base_score) / config.league_length +
        config.base_league)
    return Math.round(rawLP)
  }

  async getRatingProgress(user: UserModel): Promise<number> {
    if (!user.elo) return 0
    if (user.elo.matches > 5) return 100
    return (user.elo.matches / 5) * 100
  }
}

function odds(winner: number, loser: number) {
  return 1 / (1 + 10 ** ((loser - winner) / 400))
}
