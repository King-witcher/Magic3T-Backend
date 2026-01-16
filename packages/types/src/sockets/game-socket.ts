import type { RatingPayload } from '../api/common/rating'
import type { UserPayload } from '../api/common/user'
import type { Choice, Team } from '../common'

export const enum MatchClientEvents {
  GetAssignments = 'get-assignments',
  GetState = 'get-state',
  Pick = 'pick',
  Message = 'message',
  Surrender = 'surrender',
}

export const enum MatchServerEvents {
  Message = 'message',
  /// Sends the player assignments
  Assignments = 'assignments',
  /// Send the match state report
  StateReport = 'state-report',
  /// Send the match result report
  MatchReport = 'match-report',
}

export type MessagePayload = {
  message: string
  sender: string
  time: number
}

export type AssignmentsPayload = {
  [Team.Order]: {
    profile: UserPayload
  }
  [Team.Chaos]: {
    profile: UserPayload
  }
}

export type MatchReportPayload = {
  matchId: string
  winner: Team | null
  [Team.Order]: {
    score: number
    lpGain: number
    newRating: RatingPayload
  }
  [Team.Chaos]: {
    score: number
    lpGain: number
    newRating: RatingPayload
  }
}

export type StateReportPayload = {
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

export interface GameServerEventsMap {
  [MatchServerEvents.Message](message: MessagePayload): void
  [MatchServerEvents.Assignments](assignments: AssignmentsPayload): void
  [MatchServerEvents.StateReport](state: StateReportPayload): void
  [MatchServerEvents.MatchReport](results: MatchReportPayload): void
}

export interface GameClientEventsMap {
  [MatchClientEvents.GetAssignments](): void
  [MatchClientEvents.GetState](): void
  [MatchClientEvents.Message](message: string): void
  [MatchClientEvents.Pick](choice: Choice): void
  [MatchClientEvents.Surrender](): void
}
