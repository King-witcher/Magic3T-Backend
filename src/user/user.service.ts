import { BaseError } from '@/common/errors/base-error'
import { ConfigRepository, League, UserDto, UserRepository } from '@/database'
import { RatingService } from '@/rating'
import { HttpStatus, Injectable } from '@nestjs/common'
import { range } from 'lodash'

const baseIcons = [...range(0, 30), ...range(3455, 3464)]

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private configRepository: ConfigRepository,
    private ratingService: RatingService
  ) {}

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
    if (
      !baseIcons.includes(newIcon) &&
      (await this.userRepository.getIconAssignment(userId, newIcon)) === null
    ) {
      throw new BaseError("you don't have this icon", HttpStatus.BAD_REQUEST)
    }

    await this.userRepository.update({
      _id: userId,
      summoner_icon: newIcon,
    })
  }

  async getById(id: string): Promise<UserDto | null> {
    const user = await this.userRepository.get(id)
    return user && (await UserDto.fromModel(user, this.ratingService))
  }

  async getByNickname(nickname: string): Promise<UserDto | null> {
    const user = await this.userRepository.getByNickname(nickname)
    return user && (await UserDto.fromModel(user, this.ratingService))
  }

  async getRanking(): Promise<UserDto[]> {
    const [bestPlayers, ratingConfig] = await Promise.all([
      this.userRepository.getBest(50),
      this.configRepository.cachedGetRatingConfig(),
    ])

    const bestPlayersDtos = await Promise.all(
      bestPlayers
        // Filter only players with an identification
        .filter((player) => !!player.identification)
        // Convert to Dtos
        .map((model) => UserDto.fromModel(model, this.ratingService))
    )

    const qualified = bestPlayersDtos.filter(
      (player) => player.rating.league !== League.Provisional
    )

    const notQualified =
      bestPlayersDtos
        .filter((player) => player.rating.league === League.Provisional)
        // Sort not qualified players by nickname instead of invalid scores.
        .sort((a, b) => a.nickname!.localeCompare(b.nickname!)) ?? []

    return [...qualified, ...notQualified]
  }

  async getIcons(user: string): Promise<number[]> {
    const iconAssigments = await this.userRepository.getIconAssignments(user)
    const assignedIcons = iconAssigments.map((assigment) =>
      Number.parseInt(assigment._id)
    )
    return [...assignedIcons, ...baseIcons]
  }
}
