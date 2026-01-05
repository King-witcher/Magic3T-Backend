import { Choice, Team } from '../../common'
import type { League } from './rating'

export const enum MatchPayloadEvents {
  Choice = 0,
  Forfeit = 1,
  Timeout = 2,
  Message = 3,
}

type BaseMatchPayloadEvent = {
  event: MatchPayloadEvents
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
        event: MatchPayloadEvents.Choice
        choice: Choice
      }
    | {
        event: MatchPayloadEvents.Message
        message: string
      }
    | {
        event: MatchPayloadEvents.Timeout | MatchPayloadEvents.Forfeit
      }
  )

export interface MatchPayload {
  id: string
  teams: Record<Team, MatchPayloadTeam>
  events: MatchPayloadEvent[]
  winner: Team | null
  time: number
}
