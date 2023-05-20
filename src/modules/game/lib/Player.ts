import { v4 } from 'uuid'
import { GameEvent } from './GameEvent'

export interface PlayerReport {
  nickname: string | null
  initialRating: number
  remainingTime: number
  choices: number[]
}

export class Player {
  playerId: string = v4()
  oponent: Player = this
  choices: number[] = []
  pendingEvents: GameEvent[] = []
  remainingTime = 0

  constructor(public nickname: string | null, public rating: number) {}

  hasNumber(number: number): boolean {
    return this.choices.indexOf(number) !== -1
  }

  getStateReport(): PlayerReport {
    return {
      choices: this.choices,
      nickname: this.nickname,
      initialRating: this.rating,
      remainingTime: this.remainingTime,
    }
  }

  push(number: number) {
    this.choices.push(number)
  }

  assignOponent(oponent: Player) {
    this.oponent = oponent
    oponent.oponent = this
  }

  won(): boolean {
    for (let i = 0; i < this.choices.length; i++)
      for (let j = i + 1; j < this.choices.length; j++)
        for (let k = j + 1; k < this.choices.length; k++)
          if (i + j + k === 15) return true
    return false
  }
}
