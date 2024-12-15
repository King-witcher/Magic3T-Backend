import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'
import { UserRepository } from '@/database'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotImplementedException,
  Patch,
  UseGuards,
} from '@nestjs/common'
import { ChangeNickDto } from './dtos/change-nick'

@Controller('user')
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getMe() {
    throw new NotImplementedException()
  }

  @Patch('me/nickname')
  @UseGuards(AuthGuard)
  async changeNickName(
    @UserId() userId: string,
    @Body() changeNickDto: ChangeNickDto,
  ) {
    const user = await this.userRepository.get(userId)
    if (!user) {
      throw new InternalServerErrorException()
    }

    if (user.nickname === changeNickDto.nickname) {
      throw new BadRequestException(
        'nickname must be different from the current',
      )
    }

    if (
      user.nicknameDate &&
      Date.now() - user.nicknameDate.getTime() < 1000 * 60 * 60 * 24 * 30
    ) {
      throw new BadRequestException(
        'cannot change nickname more than once every 30 days',
      )
    }

    const nicknameOwner = await this.userRepository.getByNickname(
      changeNickDto.nickname,
    )

    if (nicknameOwner) {
      throw new BadRequestException('the nickname is already being used')
    }

    throw new NotImplementedException()
  }
}
