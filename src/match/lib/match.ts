import { Err, Observable, Ok, Result, Stopwatch } from '@/common'
import {
  Choice,
  MatchPayloadEvents,
  MatchRowEvent,
  StateReportPayload,
  Team,
  UserRow,
} from '@magic3t/types'
import { Player } from './player'

export enum MatchError {
  BadTurn = 'bad-turn',
  ChoiceUnavailable = 'choice-unavailable',
}

export enum MatchEventType {
  Start = 0,
  Choice = 1,
  Surrender = 2,
  Timeout = 3,
  Finish = 4,
}

export type MatchEventsMap = {
  [MatchEventType.Start](): void
  [MatchEventType.Choice](side: Team, choice: Choice, timestamp: number): void
  [MatchEventType.Surrender](side: Team, timestamp: number): void
  [MatchEventType.Timeout](side: Team, timestamp: number): void
  [MatchEventType.Finish](self: Match, winner: Team | null): void
}

interface MatchParams {
  timelimit: number
  [Team.Order]: UserRow
  [Team.Chaos]: UserRow
}

export class Match extends Observable<MatchEventsMap> {
  private globalTime = new Stopwatch()
  public id: string
  public events: MatchRowEvent[] = []
  public turn: Team | null = null
  public winner: Team | null = null
  public finished = false
  public [Team.Order]: Player
  public [Team.Chaos]: Player
  public timelimit: number
  public assignments: Record<Team, UserRow>

  constructor({
    timelimit,
    [Team.Order]: order,
    [Team.Chaos]: chaos,
  }: MatchParams) {
    super()
    this.timelimit = timelimit

    this.assignments = {
      [Team.Order]: order,
      [Team.Chaos]: chaos,
    }

    this[Team.Order] = new Player(timelimit, () =>
      this.handleTimeout(Team.Order)
    )
    this[Team.Chaos] = new Player(timelimit, () =>
      this.handleTimeout(Team.Chaos)
    )
  }

  public get time() {
    return this.globalTime.time
  }

  private get isDrawn() {
    return this[Team.Order].count + this[Team.Chaos].count === 9
  }

  public get stateReport(): StateReportPayload {
    const order = this[Team.Order]
    const chaos = this[Team.Chaos]

    const report: StateReportPayload = {
      [Team.Order]: {
        choices: [...order.choices],
        surrender: order.surrender,
        timeLeft: order.timer.remaining,
      },
      [Team.Chaos]: {
        choices: [...chaos.choices],
        surrender: chaos.surrender,
        timeLeft: chaos.timer.remaining,
      },
      turn: this.turn,
      pending: false,
      finished: this.finished,
    }

    return report
  }

  public getFinalScore(team: Team): number | null {
    if (!this.finished) return null
    if (this.winner !== null) return team === this.winner ? 1 : 0
    const playerTime = this.timelimit - this[team].timer.remaining
    const opponentTime = this.timelimit - this[1 - team].timer.remaining
    return playerTime / (playerTime + opponentTime)
  }

  public start() {
    if (this.turn !== null || this.finished)
      throw new Error('panic: called start() twice')

    this[Team.Order].timer.start()
    this.globalTime.start()
    this.turn = Team.Order
    this.emit(MatchEventType.Start)
  }

  private isAvailable(choice: Choice) {
    return (
      !this[Team.Chaos].choices.includes(choice) &&
      !this[Team.Order].choices.includes(choice)
    )
  }

  /**
   * Checks if the specified team has a magic3t combination.
   * @param team The team to check for magic3t
   * @returns True if the team has a magic3t combination, false otherwise.
   */
  private hasMagic3T(team: Team): boolean {
    const player = this[team]

    const choices = player.choices
    for (let i = 0; i < choices.length; i++)
      for (let j = i + 1; j < choices.length; j++)
        for (let k = j + 1; k < choices.length; k++)
          if (choices[i] + choices[j] + choices[k] === 15) return true
    return false
  }

  private declareWinner(team: Team | null) {
    this.globalTime.pause()
    this[Team.Order].timer.pause()
    this[Team.Chaos].timer.pause()
    this.winner = team
    this.finished = true
    this.turn = null
    this.emit(MatchEventType.Finish, this, team)
  }

  public handleChoice(team: Team, choice: Choice): Result<[], MatchError> {
    if (this.turn !== team) return Err(MatchError.BadTurn)
    if (!this.isAvailable(choice)) return Err(MatchError.ChoiceUnavailable)

    this[Team.Order].timer.pause()
    this[Team.Chaos].timer.pause()

    const player = this[team]
    player.choices.push(choice)

    this.events.push({
      event: MatchPayloadEvents.Choice,
      choice,
      side: team,
      time: this.time,
    })

    this.turn = 1 - team
    this[1 - team].timer.start()

    if (this.hasMagic3T(team)) {
      this.declareWinner(team)
      this.emit(MatchEventType.Choice, team, choice, this.time)
      return Ok([])
    }

    if (this.isDrawn) {
      this.declareWinner(null)
      this.emit(MatchEventType.Choice, team, choice, this.time)
      return Ok([])
    }

    this.emit(MatchEventType.Choice, team, choice, this.time)
    return Ok([])
  }

  public handleSurrender(side: Team): Result<[], MatchError> {
    if (this.turn === null) return Err(MatchError.BadTurn)

    const player = this[side]
    player.surrender = true

    this.events.push({
      event: MatchPayloadEvents.Forfeit,
      side,
      time: this.time,
    })

    this.declareWinner(1 - side)
    this.emit(MatchEventType.Surrender, side, this.time)

    return Ok([])
  }

  private handleTimeout(side: Team) {
    const opposite = 1 - side

    this.events.push({
      event: MatchPayloadEvents.Timeout,
      side,
      time: this.time,
    })

    this.declareWinner(opposite)
    this.emit(MatchEventType.Timeout, side, this.time)
  }
}
