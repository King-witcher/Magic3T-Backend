import { BaseError } from '@/common/errors/base-error'
import { ConfigRepository, UserPayload, UserRepository } from '@/database'
import { RatingService } from '@/rating'
import { League, RegisterUserCommand, UserRole, UserRow } from '@magic3t/types'
import { HttpStatus, Injectable } from '@nestjs/common'
import { range } from 'lodash'

const baseIcons = [...range(59, 79), ...range(0, 30)]

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

  async getById(id: string): Promise<UserPayload | null> {
    const user = await this.userRepository.get(id)
    return user && (await UserPayload.fromRow(user, this.ratingService))
  }

  async getByNickname(nickname: string): Promise<UserPayload | null> {
    const user = await this.userRepository.getByNickname(nickname)
    return user && (await UserPayload.fromRow(user, this.ratingService))
  }

  async getRanking(): Promise<UserPayload[]> {
    const [bestPlayers, ratingConfig] = await Promise.all([
      this.userRepository.getBest(50),
      this.configRepository.cachedGetRatingConfig(),
    ])

    const bestPlayersDtos = await Promise.all(
      bestPlayers
        // Filter only players with an identification
        .filter((player) => !!player.identification)
        // Convert to Dtos
        .map((model) => UserPayload.fromRow(model, this.ratingService))
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

  async register(userId: string, body: RegisterUserCommand) {
    const user = await this.userRepository.get(userId)
    if (user)
      throw new BaseError('user already registered', HttpStatus.BAD_REQUEST)
    const ratingConfig = await this.configRepository.cachedGetRatingConfig()

    const userRow: UserRow = {
      _id: userId,
      elo: {
        k: ratingConfig.initial_k_value,
        score: ratingConfig.base_score,
        matches: 0,
      },
      experience: 0,
      glicko: {
        deviation: ratingConfig.max_rd,
        rating: ratingConfig.base_score,
        timestamp: new Date(),
      },
      identification: {
        last_changed: new Date(),
        nickname: body.nickname,
        unique_id: this.userRepository.getSlug(body.nickname),
      },
      magic_points: 0,
      perfect_squares: 0,
      role: UserRole.Player,
      stats: {
        defeats: 0,
        draws: 0,
        wins: 0,
      },
      summoner_icon: 29,
    }

    await this.userRepository.create(userRow)
  }
}
