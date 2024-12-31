import { BaseError } from '@/common/errors/base-error'
import { UserDto, UserRepository } from '@/database'
import { HttpStatus, Injectable } from '@nestjs/common'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async changeNickName(userId: string, newNickname: string) {
    const user = await this.userRepository.get(userId)
    // User does not exist
    if (!user) {
      throw new BaseError('', HttpStatus.INTERNAL_SERVER_ERROR)
    }

    // Recently changed nickname
    if (
      user.identification &&
      Date.now() - user.identification.last_changed.getTime() <
        1000 * 60 * 60 * 24 * 30
    ) {
      throw new BaseError(
        'cannot change nickname more than once every 30 days',
        HttpStatus.BAD_REQUEST
      )
    }

    // Same nickname
    if (user.identification?.nickname === newNickname) {
      throw new BaseError(
        'nickname must be different from the current',
        HttpStatus.BAD_REQUEST
      )
    }

    // Nickname unavailable
    const nicknameOwner = await this.userRepository.getByNickname(newNickname)
    if (nicknameOwner) {
      throw new BaseError(
        'the nickname is already being used',
        HttpStatus.BAD_REQUEST
      )
    }

    await this.userRepository.updateNickname(user._id, newNickname)
  }

  async changeIcon(userId: string, newIcon: number) {
    if (newIcon > 29 || newIcon < 0)
      throw new BaseError('bad icon id', HttpStatus.BAD_REQUEST)

    await this.userRepository.update({
      _id: userId,
      summoner_icon: newIcon,
    })
  }

  async getById(id: string): Promise<UserDto | null> {
    const user = await this.userRepository.get(id)
    return user && UserDto.fromModel(user)
  }
}
