import { GetUserResult, ListUsersResultData } from '@magic3t/api-types'
import { UserRow } from '@magic3t/database-types'
import { Injectable } from '@nestjs/common'
import { RatingService } from '@/rating'

@Injectable()
export class UserService {
  constructor(private ratingService: RatingService) {}

  async getUserByRow(row: UserRow): Promise<GetUserResult> {
    const rating = await this.ratingService.getRating(row)
    return {
      id: row._id,
      role: row.role,
      nickname: row.identification.nickname,
      summonerIcon: row.summoner_icon,
      stats: row.stats,
      rating,
    }
  }

  async getListedUserByRow(row: UserRow): Promise<ListUsersResultData> {
    return {
      id: row._id,
      nickname: row.identification.nickname,
      summonerIcon: row.summoner_icon,
      role: row.role,
      rating: await this.ratingService.getRating(row),
    }
  }
}
