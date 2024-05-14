import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { IMatchAdapter } from '@modules/match/lib/adapters/matchAdapter'

export type MatchSocketData = {
  matchAdapter: IMatchAdapter
  uid: string
}

export enum MatchSocketListenedEvent {
  GetOpponent = 'get-opponent',
}

export enum MatchSocketEmittedEvent {
  OpponentUid = 'opponent-uid',
}

export type MatchSocketEmitMap = {
  message(message: string): void
  [MatchSocketEmittedEvent.OpponentUid](uid: string): void
  gameState(state: string): void
  ratingsVariation(data: { player: number; oponent: number }): void
}

export type MatchSocket = Socket<
  DefaultEventsMap,
  MatchSocketEmitMap,
  DefaultEventsMap,
  MatchSocketData
>
