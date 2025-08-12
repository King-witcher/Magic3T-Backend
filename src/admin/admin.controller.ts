import { Controller, Post, UseGuards } from '@nestjs/common'
import { AdminGuard } from './admin.guard'
import { ConfigRepository, UserRepository } from '@/database'
import { ApiOperation } from '@nestjs/swagger'
import { AuthGuard } from '@/auth/auth.guard'

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private usersRepository: UserRepository,
    private configRepository: ConfigRepository
  ) {}

  @ApiOperation({})
  @Post('reset-ratings')
  async resetRatings() {
    const ratingConfig = await this.configRepository.cachedGetRatingConfig()
    const users = await this.usersRepository.getAll()

    await Promise.all(
      users.map((user) => {
        this.usersRepository.save({
          ...user,
          elo: {
            score: ratingConfig.base_score,
            k: ratingConfig.initial_k_value,
            matches: 0,
          },
          glicko: {
            rating: ratingConfig.base_score,
            deviation: ratingConfig.max_rd,
            timestamp: new Date(),
          },
        })
      })
    )
  }
}
