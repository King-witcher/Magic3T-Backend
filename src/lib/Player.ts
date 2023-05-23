import { v4 } from 'uuid'
import Timer from 'src/lib/Timer'

export interface PlayerReport {
  nickname: string | null
  initialRating: number | null
  remainingTime: number
  choices: Choice[]
}

export type Choice = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export class Player {
  readonly playerId: string = v4()
  readonly nickname: string | null
  readonly rating: number | null
  oponent: Player = this
  choices: Choice[] = []
  timer: Timer

  constructor(
    nickname: string | null,
    rating: number | null,
    timelimit: number
  ) {
    this.nickname = nickname
    this.rating = rating
    this.timer = new Timer(timelimit)
  }

  hasChoice(number: Choice): boolean {
    return this.choices.indexOf(number) !== -1
  }

  getStateReport(): PlayerReport {
    return {
      choices: this.choices,
      nickname: this.nickname,
      initialRating: this.rating,
      remainingTime: this.timer.getRemaining(),
    }
  }

  addChoice(number: Choice) {
    this.choices.push(number)
  }

  static setOponents(player1: Player, player2: Player) {
    player1.oponent = player2
    player2.oponent = player1
  }

  getTriple(): [Choice, Choice, Choice] | null {
    for (let i = 0; i < this.choices.length; i++)
      for (let j = i + 1; j < this.choices.length; j++)
        for (let k = j + 1; k < this.choices.length; k++)
          if (this.choices[i] + this.choices[j] + this.choices[k] === 15)
            return [this.choices[i], this.choices[j], this.choices[k]]
    return null
  }
}
