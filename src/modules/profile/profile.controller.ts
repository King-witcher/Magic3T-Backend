import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { ProfileService } from './profile.service'

@Controller('profiles')
export class ProfileController {
  constructor(public profileService: ProfileService) {}

  @Get('nicknames/:nickname')
  async getProfile(@Param('nickname') nickname: string) {
    const profile = await this.profileService.getByNickname(nickname)
    if (!profile) throw new NotFoundException()
    return {
      nickname: profile.nickname,
      rating: profile.rating,
    }
  }
}
