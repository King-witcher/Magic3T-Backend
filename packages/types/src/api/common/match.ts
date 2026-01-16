import { Choice, League, Team } from '@magic3t/common-types'
import { MatchRowEventType } from '@magic3t/database-types'

type BaseMatchPayloadEvent = {
  event: MatchRowEventType
  side: Team
  time: number
}

export interface MatchPayloadTeam {
  id: string
  nickname: string
  league: League
  division: number | null
  lpGain: number
  matchScore: number
}

export type MatchPayloadEvent = BaseMatchPayloadEvent &
  (
    | {
        event: MatchRowEventType.Choice
        choice: Choice
      }
    | {
        event: MatchRowEventType.Message
        message: string
      }
    | {
        event: MatchRowEventType.Timeout | MatchRowEventType.Forfeit
      }
  )

export interface MatchPayload {
  id: string
  teams: Record<Team, MatchPayloadTeam>
  events: MatchPayloadEvent[]
  winner: Team | null
  time: number
}
