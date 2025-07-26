import { Timer } from '@/common'
import { Choice } from '@magic3t/types'

export class Player {
  choices: Choice[] = []
  timer: Timer
  surrender = false

  constructor(timelimit: number, onTimeout: () => void) {
    this.timer = new Timer(timelimit, onTimeout)
  }

  public get count() {
    return this.choices.length
  }
}
