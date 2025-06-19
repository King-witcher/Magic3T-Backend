import { Choice, Team } from '@/common'
import { ApiProperty } from '@nestjs/swagger'
import { League } from '../user'
import { MatchEventType, MatchModel } from './match.model'

export interface MatchDtoTeam {
  id: string
  nickname: string
  league: League
  division: number | null
  lpGain: number
  matchScore: number
}

export class MatchDtoEvent {
  @ApiProperty({
    description: `The event type. ${MatchEventType.Choice} = choice, ${MatchEventType.Forfeit} = surrender, ${MatchEventType.Timeout} = timeout`,
    enum: MatchEventType,
  })
  event: MatchEventType

  @ApiProperty({
    description: 'The team that triggered the event.',
    example: Team.Chaos,
    enum: Team,
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
    description: `The choice made, if event is ${MatchEventType.Choice}; otherwise, undefined`,
    example: 7,
  })
  choice?: Choice

  message?: string
}

export class MatchDto {
  @ApiProperty({
    description: 'The match unique id',
  })
  id: string

  @ApiProperty({
    description:
      'An object mapping teams into info about that team in the match',
  })
  teams: Record<Team, MatchDtoTeam>

  @ApiProperty({
    description: 'The list of events that happened in the match',
    type: MatchDtoEvent,
    isArray: true,
  })
  events: MatchDtoEvent[]

  @ApiProperty({
    description: 'The match winner, if any; otherwise, null',
    enum: Team,
    nullable: true,
    example: Team.Chaos,
  })
  winner: Team | null

  @ApiProperty({
    description: 'The moment when the match happened',
    example: Date.now(),
  })
  time: number

  constructor(data: MatchDto) {
    Object.assign(this, data)
  }

  static async fromModel(model: MatchModel): Promise<MatchDto> {
    const modelOrder = model[Team.Order]
    const modelChaos = model[Team.Chaos]

    return new MatchDto({
      id: model._id,
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
      events: [...model.events],
      time: model.timestamp.getDate(),
      winner: model.winner,
    })
  }
}
