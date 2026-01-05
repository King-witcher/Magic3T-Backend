import type { MatchPayloadEvents } from '../api'
import type { League } from '../api/common/rating'
import type { Choice, Team } from '../common'
import type { WithId } from './with-id'

export const enum GameMode {
  Casual = 0b00,
  Ranked = 0b10,
  PvP = 0b00,
  PvC = 0b01,
}

export interface MatchRowTeam {
  uid: string
  name: string
  league: League
  division: number | null
  score: number
  lp_gain: number
}

type BaseMatchRowEvent = {
  event: MatchPayloadEvents
  side: Team
  time: number
}

export type MatchRowEvent = BaseMatchRowEvent &
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

/** Represents a match registry in the History. */
export interface MatchRow extends WithId {
  [Team.Order]: MatchRowTeam // TODO: put inside a teams object
  [Team.Chaos]: MatchRowTeam
  events: MatchRowEvent[]
  winner: Team | null
  game_mode: GameMode
  timestamp: Date
}
