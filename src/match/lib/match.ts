import { SidesEnum } from '@database'
import { Observable, Stopwatch } from '@/lib'
import { Choice } from '@/types/Choice'
import { IStateHandler, PlayerState } from './player-state'
import { MatchSideAdapter, PerspectiveGameState, PlayerStatus } from '../types'

export enum MatchEventsEnum {
  Start,
  Choice,
  Forfeit,
  Timeout,
  Finish,
}

export type MatchEventsMap = {
  [MatchEventsEnum.Start](): void
  [MatchEventsEnum.Choice](
    side: SidesEnum,
    choice: Choice,
    timestamp: number,
  ): void
  [MatchEventsEnum.Forfeit](side: SidesEnum, timestamp: number): void
  [MatchEventsEnum.Timeout](side: SidesEnum, timestamp: number): void
  [MatchEventsEnum.Finish](winner: SidesEnum | null): void
}

export class Match extends Observable<MatchEventsMap> {
  private globalTime: Stopwatch
  private [SidesEnum.White]: IStateHandler
  private [SidesEnum.Black]: IStateHandler

  constructor(timelimit = 1000 * 105) {
    super()
    this[SidesEnum.White] = new PlayerState(timelimit)
    this[SidesEnum.Black] = new PlayerState(timelimit)
    this[SidesEnum.Black].observe('timeout', () => {
      this.handleTimeout(SidesEnum.Black)
    })
    this[SidesEnum.White].observe('timeout', () => {
      this.handleTimeout(SidesEnum.White)
    })

    this.globalTime = new Stopwatch()
  }

  public get time() {
    return this.globalTime.time
  }

  public get turn(): SidesEnum | null {
    if (this[SidesEnum.White].isTurn) {
      return SidesEnum.White
    }
    if (this[SidesEnum.Black].isTurn) {
      return SidesEnum.Black
    }
    return null
  }

  private set turn(value: SidesEnum | null) {
    this[SidesEnum.White].pauseTurn()
    this[SidesEnum.Black].pauseTurn()
    value !== null && this[value].startTurn()
  }

  private get isDrawn() {
    return this[SidesEnum.White].count + this[SidesEnum.Black].count === 9
  }

  private getPlayerStatus(side: SidesEnum): PlayerStatus {
    const player = this[side]
    const opponent = this[1 - side]

    // Forfeit
    if (player.hasForfeited) return PlayerStatus.Defeat
    if (opponent.hasForfeited) return PlayerStatus.Victory

    // Timeout
    if (player.timeout) return PlayerStatus.Defeat
    if (opponent.timeout) return PlayerStatus.Victory

    // Choices
    if (player.isWinner) return PlayerStatus.Victory
    if (opponent.isWinner) return PlayerStatus.Defeat
    if (player.count + opponent.count === 9) return PlayerStatus.Draw

    // Playing
    return PlayerStatus.Playing
  }

  private getPlayerState(side: SidesEnum): PerspectiveGameState {
    const player = this[side]
    const opponent = this[1 - side]

    return {
      status: this.getPlayerStatus(side),
      playerChoices: player.choices,
      opponentChoices: opponent.choices,
      playerTimeLeft: player.timeLeft,
      opponentTimeLeft: opponent.timeLeft,
      turn: player.isTurn,
    }
  }

  public start() {
    if (this[SidesEnum.White].isTurn || this[SidesEnum.Black].isTurn) return
    if (this[SidesEnum.White].isWinner || this[SidesEnum.Black].isWinner) return

    this[SidesEnum.White].startTurn()
    this.globalTime.start()
    this.emit(MatchEventsEnum.Start)
  }

  private isAvailable(choice: Choice) {
    return (
      !this[SidesEnum.Black].includes(choice) &&
      !this[SidesEnum.White].includes(choice)
    )
  }

  private handleChoice(side: SidesEnum, choice: Choice): void {
    if (this.turn !== side)
      throw new Error(`Attempted to make choice on wrong turn. Side: ${side}`)
    if (!this.isAvailable(choice))
      throw new Error(`Attempted to make invalid choice ${choice}.`)

    this.turn = null

    const player = this[side]
    player.push(choice)

    if (player.isWinner) {
      this.globalTime.pause()
      this.emit(MatchEventsEnum.Choice, side, choice, this.time)
      this.emit(MatchEventsEnum.Finish, side)
    } else if (this.isDrawn) {
      this.emit(MatchEventsEnum.Choice, side, choice, this.time)
      this.emit(MatchEventsEnum.Finish, null)
    } else {
      this.turn = 1 - side
      this.emit(MatchEventsEnum.Choice, side, choice, this.time)
    }
  }

  private handleForfeit(side: SidesEnum) {
    if (this.turn === null) return
    this.turn = null
    this.globalTime.pause()

    this.emit(MatchEventsEnum.Forfeit, side, this.time)
    this.emit(MatchEventsEnum.Finish, 1 - side)
  }

  private handleTimeout(side: SidesEnum) {
    const opposite = 1 - side
    this.turn = null
    this.globalTime.pause()
    this.emit(MatchEventsEnum.Timeout, side, this.time)
    this.emit(MatchEventsEnum.Finish, opposite)
  }

  public getAdapter(side: SidesEnum): MatchSideAdapter {
    const self = this
    return {
      get state(): PerspectiveGameState {
        return self.getPlayerState(side)
      },
      makeChoice(choice: Choice) {
        self.handleChoice(side, choice)
      },
      forfeit() {
        self.handleForfeit(side)
      },
      observe: self.observe.bind(self),
    }
  }
}
