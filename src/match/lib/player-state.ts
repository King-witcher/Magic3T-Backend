import { Observable } from '@/lib/observable'
import { TimeSnapshotState } from '@/lib/time/stopwatchSnapshot'
import { Timer } from '@/lib/time/timer'
import { Choice } from '@/types/Choice'

export interface StateHandlerEvents {
  timeout(): unknown
}

export interface IStateHandler extends Observable<StateHandlerEvents> {
  readonly count: number
  readonly choices: Choice[]
  readonly isTurn: boolean
  readonly isWinner: boolean
  readonly timeLeft: number
  readonly timeout: boolean
  readonly initialTime: number
  readonly hasForfeited: boolean
  includes(choice: Choice): boolean
  push(choice: Choice): void
  startTurn(): void
  forfeit(): void
  pauseTurn(): void
}

/**
 * Handles the state of a 9 choices match player.
 */
export class PlayerState
  extends Observable<StateHandlerEvents>
  implements IStateHandler
{
  public readonly choices: Choice[]
  private readonly timer: Timer
  private _hasForfeited: boolean

  constructor(timelimit: number) {
    super()
    this.choices = []

    const timerCallback = () => {
      this.emit.call(this, 'timeout')
    }

    this.timer = new Timer(timelimit, timerCallback.bind(this))
  }

  public get isWinner(): boolean {
    const choices = this.choices
    for (let i = 0; i < choices.length; i++)
      for (let j = i + 1; j < choices.length; j++)
        for (let k = j + 1; k < choices.length; k++)
          if (choices[i] + choices[j] + choices[k] === 15) return true
    return false
  }

  public get isTurn(): boolean {
    return this.timer.state === TimeSnapshotState.Counting
  }

  public get hasForfeited(): boolean {
    return this._hasForfeited
  }

  public get timeLeft(): number {
    return this.timer.remaining
  }

  public set timeLeft(value: number) {
    this.timer.remaining = value
  }

  public get count(): number {
    return this.choices.length
  }

  public get initialTime(): number {
    return this.timer.initial
  }

  public includes(choice: Choice): boolean {
    return this.choices.includes(choice)
  }

  public startTurn() {
    this.timer.start()
  }

  public forfeit() {
    this._hasForfeited = true
  }

  public pauseTurn() {
    this.timer.pause()
  }

  public get timeout(): boolean {
    return this.timer.state === TimeSnapshotState.Finished
  }

  public push(choice: Choice) {
    this.choices.push(choice)
  }
}
