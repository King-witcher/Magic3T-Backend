import { GetUserResult, ListUsersResultData } from '@magic3t/api-types'
import { UserRow } from '@magic3t/database-types'
import { Injectable } from '@nestjs/common'
import { GetResult } from '@/database/types'
import { RatingService } from '@/rating'

@Injectable()
export class UserService {
  constructor(private ratingService: RatingService) {}

  async getUserByRow(row: GetResult<UserRow>): Promise<GetUserResult> {
    const rating = await this.ratingService.getRatingData({
      k: row.data.elo.k,
      matches: row.data.elo.matches,
      rating: row.data.elo.score,
      challenger: row.data.elo.challenger,
    })

    return {
      id: row.id,
      role: row.data.role,
      nickname: row.data.identification.nickname,
      summonerIcon: row.data.summoner_icon,
      stats: row.data.stats,
      rating,
    }
  }

  async getListedUserByRow(row: GetResult<UserRow>): Promise<ListUsersResultData> {
    const rating = await this.ratingService.getRatingData({
      k: row.data.elo.k,
      matches: row.data.elo.matches,
      rating: row.data.elo.score,
      challenger: row.data.elo.challenger,
    })

    return {
      id: row.id,
      role: row.data.role,
      nickname: row.data.identification.nickname,
      summonerIcon: row.data.summoner_icon,
      rating,
    }
  }
}
