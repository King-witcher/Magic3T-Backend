import { AuthSocketData } from '@/auth/auth-socket'
import { Glicko, Team, UserModel } from '@/database'
import { PerspectiveGameState } from '@/match/types/perspective.game.state'
import { Choice } from '@/types/Choice'
import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { Perspective } from '../lib/perspective'

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
  /// Sends the player assignments
  Assignments = 'assignments', // new
  /// Send the match state report
  StateReport = 'state-report', // new
  /// Send the match result report
  MatchReport = 'match-report', // new
  /// @deprecated
  RatingsVariation = 'ratings-variation',
}

export type AssignmentsData = {
  [Team.Order]: {
    profile: UserModel // Use DTO instead of the whole model?
  }
  [Team.Chaos]: {
    profile: UserModel
  }
}

export type StateReportData = {
  [Team.Order]: {
    timeLeft: number
    choices: Choice[]
    surrender: boolean
  }
  [Team.Chaos]: {
    timeLeft: number
    choices: Choice[]
    surrender: boolean
  }
  turn: Team | null
  finished: boolean
  pending: false
}

export type MatchReportData = {
  matchId: string
  winner: Team | null
  [Team.Order]: {
    score: number
    gain: number
    newRating: Glicko
  }
  [Team.Chaos]: {
    score: number
    gain: number
    newRating: Glicko
  }
}

export type MessageData = {
  message: string
  sender: string
}

export type MatchSocketEmitMap = {
  [MatchSocketEmittedEvent.Message](message: MessageData): void
  [MatchSocketEmittedEvent.OpponentUid](uid: string): void
  [MatchSocketEmittedEvent.GameState](state: PerspectiveGameState): void
  [MatchSocketEmittedEvent.Assignments](assignments: AssignmentsData): void
  [MatchSocketEmittedEvent.StateReport](report: StateReportData): void
  [MatchSocketEmittedEvent.MatchReport](report: MatchReportData): void
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
