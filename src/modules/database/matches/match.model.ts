import { Choice } from '@/types/Choice'
import { WithId } from '@modules/database/types/withId'

export interface MatchPlayer {
  uid: string
  name: string
  rating: number
  rv: number
}

export enum SidesEnum {
  White = 0,
  Black = 1,
}

export enum GameModesEnum {
  CasualPvP,
  RankedPvP,
  CasualPvC,
  RankedPvC,
}

export enum HistoryMatchEventsEnum {
  Choice,
  Forfeit,
  Timeout,
  Message,
}

type BaseMatchEvent = {
  event: HistoryMatchEventsEnum
  side: SidesEnum
  time: number
}

export type HistoryMatchEvent = BaseMatchEvent &
  (
    | {
        event: HistoryMatchEventsEnum.Choice
        choice: Choice
      }
    | {
        event: HistoryMatchEventsEnum.Message
        message: string
      }
    | {
        event: HistoryMatchEventsEnum.Timeout | HistoryMatchEventsEnum.Forfeit
      }
  )

/** Represents a match registry in the History. */
export interface MatchModel extends WithId {
  white: MatchPlayer
  black: MatchPlayer
  events: HistoryMatchEvent[]
  winner: SidesEnum | null
  gameMode: GameModesEnum
  timestamp: Date
}
