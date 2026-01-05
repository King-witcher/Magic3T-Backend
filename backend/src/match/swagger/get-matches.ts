import {
  GetMatchesResult as GetMatchesResultType,
  MatchPayload as MatchPayloadType,
} from '@magic3t/types'
import { ApiProperty } from '@nestjs/swagger'
import { MatchPayload as MatchPayloadClass } from './match-payload'

export class GetMatchesQuery {
  @ApiProperty({
    description: 'The user ID to filter matches by',
    type: 'string',
    nullable: true,
  })
  userId?: string

  @ApiProperty({
    description: 'The cursor for pagination. If cursor is provided, userId will be ignored.',
    type: 'string',
    nullable: true,
  })
  cursor?: string
}

export class GetMatchesResult implements GetMatchesResultType {
  @ApiProperty({
    type: MatchPayloadClass,
    isArray: true,
    description: 'The list of matches',
  })
  matches: MatchPayloadType[]

  @ApiProperty({
    description: 'The cursor for pagination',
    type: 'string',
    nullable: true,
  })
  cursor: string | null
}
