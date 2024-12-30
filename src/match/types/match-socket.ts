import { AuthSocketData } from '@/auth/auth-socket'
import { RatingDto, Team, UserDto } from '@/database'
import { Choice } from '@/types/Choice'
import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { Perspective } from '../lib/perspective'

export type MatchSocketData = AuthSocketData & {
  perspective: Perspective
}

export enum ClientMatchEvents {
  GetAssignments = 'get-assignments',
  GetState = 'get-state',
  Pick = 'pick',
  Message = 'message',
  Surrender = 'surrender',
}

export enum ServerMatchEvents {
  Message = 'message',
  /// Sends the player assignments
  Assignments = 'assignments', // new
  /// Send the match state report
  StateReport = 'state-report', // new
  /// Send the match result report
  MatchReport = 'match-report', // new
}

export type AssignmentsData = {
  [Team.Order]: {
    profile: UserDto
  }
  [Team.Chaos]: {
    profile: UserDto
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
    newRating: RatingDto
  }
  [Team.Chaos]: {
    score: number
    gain: number
    newRating: RatingDto
  }
}

export type MessageData = {
  message: string
  sender: string
  time: number
}

export type MatchServerEventsMap = {
  [ServerMatchEvents.Message](message: MessageData): void
  [ServerMatchEvents.Assignments](assignments: AssignmentsData): void
  [ServerMatchEvents.StateReport](report: StateReportData): void
  [ServerMatchEvents.MatchReport](report: MatchReportData): void
}

export type MatchSocket = Socket<
  DefaultEventsMap,
  MatchServerEventsMap,
  DefaultEventsMap,
  MatchSocketData
>
