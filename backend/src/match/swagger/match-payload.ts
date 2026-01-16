import { Choice, Team } from '@magic3t/common-types'
import { MatchRowEvent, MatchRowEventType, MatchRowTeam } from '@magic3t/database-types'
import { ApiProperty } from '@nestjs/swagger'

export class MatchPayloadEvent {
  @ApiProperty({
    description: `The event type. ${MatchRowEventType.Choice} = choice, ${MatchRowEventType.Forfeit} = surrender, ${MatchRowEventType.Timeout} = timeout`,
    enum: [MatchRowEventType.Choice, MatchRowEventType.Forfeit, MatchRowEventType.Timeout],
  })
  event: MatchRowEventType

  @ApiProperty({
    description: 'The team that triggered the event.',
    example: Team.Chaos,
    enum: [Team.Order, Team.Chaos],
  })
  side: Team

  @ApiProperty({
    description: 'The time when the event happened in millisseconds after the match began.',
    example: 1532,
  })
  time: number

  @ApiProperty({
    nullable: true,
    description: `The choice made, if event is ${MatchRowEventType.Choice}; otherwise, undefined`,
    example: 7,
  })
  choice?: Choice

  message?: string
}

export class MatchPayload {
  @ApiProperty({
    description: 'The match unique id',
  })
  id: string

  @ApiProperty({
    description: 'An object mapping teams into info about that team in the match',
  })
  teams: Record<Team, MatchRowTeam>

  @ApiProperty({
    description: 'The list of events that happened in the match',
    type: MatchPayloadEvent,
    isArray: true,
  })
  events: MatchRowEvent[]

  @ApiProperty({
    description: 'The match winner, if any; otherwise, null',
    enum: [Team.Order, Team.Chaos],
    nullable: true,
    example: Team.Chaos,
  })
  winner: Team | null

  @ApiProperty({
    description: 'The moment when the match happened',
    example: Date.now(),
  })
  time: number

  constructor(data: MatchPayload) {
    Object.assign(this, data)
  }
}
