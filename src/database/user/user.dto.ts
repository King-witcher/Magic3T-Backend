import { RatingService } from '@/rating'
import {
  Division,
  League,
  UserRow,
  UserRole,
  RatingPayload,
  UserPayload as UserPayloadType,
} from '@magic3t/types'
import { ApiProperty } from '@nestjs/swagger'

export class RatingDto implements RatingPayload {
  @ApiProperty({
    description: "The player's league",
    example: League.Provisional,
  })
  league: League

  @ApiProperty({
    description: "The player's division in the league",
    nullable: true,
    example: 1,
  })
  division: Division | null

  @ApiProperty({
    description: "The player's LP in the division",
    nullable: true,
    example: 22,
  })
  points: number | null

  @ApiProperty({
    description: "The player's progress towards being qualified",
    nullable: true,
    default: 0,
  })
  progress: number

  constructor(data: RatingDto) {
    Object.assign(this, data)
  }
}

export class UserPayload implements UserPayloadType {
  @ApiProperty({
    description: 'The user unique id',
    example: 'RdZ0ThlzqfMEpcwDEYaND7avAi42',
  })
  id: string

  @ApiProperty({
    example: 'King Witcher',
  })
  nickname: string

  @ApiProperty({
    description: 'The summoner icon id of the icon being used',
    example: '1394',
    default: '29',
  })
  summonerIcon: number

  @ApiProperty({
    description:
      "The user role in Magic3T. Can be either 'player', 'bot', or 'creator'",
    default: 'player',
    example: 'creator',
    enum: [UserRole.Bot, UserRole.Player, UserRole.Creator],
  })
  role: UserRole

  @ApiProperty({
    description: 'The rating params of the user',
    type: RatingDto,
  })
  rating: RatingPayload

  @ApiProperty({
    description: "The player's wins, draws and defeats",
    example: {
      wins: 23,
      draws: 8,
      defeats: 17,
    },
  })
  stats: {
    wins: number
    draws: number
    defeats: number
  }

  constructor(data: UserPayloadType) {
    Object.assign(this, data)
  }

  static async fromRow(
    row: UserRow,
    ratingService: RatingService
  ): Promise<UserPayload> {
    return new UserPayload({
      id: row._id,
      nickname: row.identification?.nickname || '',
      summonerIcon: row.summoner_icon,
      role: row.role,
      stats: {
        wins: row.stats.wins,
        draws: row.stats.draws,
        defeats: row.stats.defeats,
      },
      rating: await ratingService.getRating(row),
    })
  }
}
