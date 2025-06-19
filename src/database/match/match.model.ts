import { Choice, Team } from '@/common'
import { WithId } from '@/database/types/withId'
import { League } from '../user'

export interface MatchModelTeam {
  uid: string
  name: string
  league: League
  division: number | null
  score: number
  lp_gain: number
}

export enum GameMode {
  Casual = 0b00,
  Ranked = 0b10,
  PvP = 0b00,
  PvC = 0b01,
}

export enum MatchEventType {
  Choice = 0,
  Forfeit = 1,
  Timeout = 2,
  Message = 3,
}

type BaseMatchEvent = {
  event: MatchEventType
  side: Team
  time: number
}

export type MatchModelEvent = BaseMatchEvent &
  (
    | {
        event: MatchEventType.Choice
        choice: Choice
      }
    | {
        event: MatchEventType.Message
        message: string
      }
    | {
        event: MatchEventType.Timeout | MatchEventType.Forfeit
      }
  )

/** Represents a match registry in the History. */
export interface MatchModel extends WithId {
  [Team.Order]: MatchModelTeam // TODO: put inside a teams object
  [Team.Chaos]: MatchModelTeam
  events: MatchModelEvent[]
  winner: Team | null
  game_mode: GameMode
  timestamp: Date
}
