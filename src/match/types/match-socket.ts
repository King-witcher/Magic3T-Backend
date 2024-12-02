import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { PerspectiveGameState } from '@/match/types/perspective.game.state'
import { MatchSideAdapter } from './match-side-adapter'
import { AuthSocketData } from '@/auth/auth-socket'

export type MatchSocketData = AuthSocketData & {
  matchAdapter: MatchSideAdapter
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
  RatingsVariation = 'ratings-variation',
}

export type MatchSocketEmitMap = {
  [MatchSocketEmittedEvent.Message](message: string): void
  [MatchSocketEmittedEvent.OpponentUid](uid: string): void
  [MatchSocketEmittedEvent.GameState](state: PerspectiveGameState): void
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
