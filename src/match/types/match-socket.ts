import { AuthSocketData } from '@/auth/auth-socket'
import { Glicko, SidesEnum } from '@/database'
import { PerspectiveGameState } from '@/match/types/perspective.game.state'
import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { Perspective } from './match-side-adapter'

export type MatchSocketData = AuthSocketData & {
  perspective: Perspective
}

export enum MatchSocketListenedEvent {
  GetOpponent = 'get-opponent',
  GetState = 'get-state',
  Choice = 'choice',
  Message = 'message',
  Forfeit = 'forfeit',
}

export enum MatchSocketEmittedEvent {
  Message = 'message',
  OpponentUid = 'opponent-uid',
  GameState = 'game-state',
  MatchReport = 'match-report',
  RatingsVariation = 'ratings-variation',
}

export type MatchReportData = {
  matchId: string
  winner: SidesEnum | null
  white: {
    score: number
    gain: number
    newRating: Glicko
  }
  black: {
    score: number
    gain: number
    newRating: Glicko
  }
}

export type MatchSocketEmitMap = {
  [MatchSocketEmittedEvent.Message](message: string): void
  [MatchSocketEmittedEvent.OpponentUid](uid: string): void
  [MatchSocketEmittedEvent.GameState](state: PerspectiveGameState): void
  [MatchSocketEmittedEvent.MatchReport](matchReport: MatchReportData)
  [MatchSocketEmittedEvent.RatingsVariation](data: {
    player: number
    opponent: number
  }): void
}

export type MatchSocket = Socket<
  DefaultEventsMap,
  MatchSocketEmitMap,
  DefaultEventsMap,
  MatchSocketData
>
