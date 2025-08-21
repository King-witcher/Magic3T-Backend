import {
  Choice,
  MatchPayloadEvents,
  MatchPayloadTeam,
  MatchRow,
  MatchRowEvent,
  Team,
} from '@magic3t/types'
import { ApiProperty } from '@nestjs/swagger'

export class MatchPayloadEvent {
  @ApiProperty({
    description: `The event type. ${MatchPayloadEvents.Choice} = choice, ${MatchPayloadEvents.Forfeit} = surrender, ${MatchPayloadEvents.Timeout} = timeout`,
    enum: [
      MatchPayloadEvents.Choice,
      MatchPayloadEvents.Forfeit,
      MatchPayloadEvents.Timeout,
    ],
  })
  event: MatchPayloadEvents

  @ApiProperty({
    description: 'The team that triggered the event.',
    example: Team.Chaos,
    enum: [Team.Order, Team.Chaos],
  })
  side: Team

  @ApiProperty({
    description:
      'The time when the event happened in millisseconds after the match began.',
    example: 1532,
  })
  time: number

  @ApiProperty({
    nullable: true,
    description: `The choice made, if event is ${MatchPayloadEvents.Choice}; otherwise, undefined`,
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
    description:
      'An object mapping teams into info about that team in the match',
  })
  teams: Record<Team, MatchPayloadTeam>

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

  static fromRow(row: MatchRow): MatchPayload {
    const modelOrder = row[Team.Order]
    const modelChaos = row[Team.Chaos]

    return new MatchPayload({
      id: row._id,
      teams: {
        [Team.Order]: {
          id: modelOrder.uid,
          matchScore: modelOrder.score,
          nickname: modelOrder.name,
          league: modelOrder.league,
          division: modelOrder.division,
          lpGain: modelOrder.lp_gain,
        },
        [Team.Chaos]: {
          id: modelChaos.uid,
          matchScore: modelChaos.score,
          nickname: modelChaos.name,
          league: modelChaos.league,
          division: modelChaos.division,
          lpGain: modelChaos.lp_gain,
        },
      },
      events: [...row.events],
      time: row.timestamp.getDate(),
      winner: row.winner,
    })
  }
}
