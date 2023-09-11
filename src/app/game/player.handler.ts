import Timer from 'src/lib/Timer'
import { GameHandler } from './game.handler'
import { Choice } from 'src/lib/Player'
import {
  ChoiceUnavailableException,
  GameFinishedException,
  WrongTurnException,
} from './game.exceptions'
import { PlayerResult as PlayerResult } from './game.types'
import { Socket } from 'socket.io'

interface PlayerOptions {
  timeLimit: number
  timeoutCallback: (player: PlayerHandler) => void
}

export class PlayerHandler {
  socket: Socket | null
  choices: Choice[] = []
  timer: Timer
  oponent: PlayerHandler
  ready: boolean = false
  turn: boolean = false
  result: PlayerResult | null

  constructor({ timeLimit, timeoutCallback }: PlayerOptions) {
    this.timer = new Timer(timeLimit * 1000, () => timeoutCallback(this)) // Possível erro de bind
    this.oponent = this
  }

  onTimeout() {
    this.oponent.result = PlayerResult.Victory
    this.result = PlayerResult.Defeat
    this.turn = false
    this.oponent.turn = false
  }

  //** Retorna um array com 3 Choices se o jogador for vencedor; caso contrário, false. */
  isWinner(): [Choice, Choice, Choice] | false {
    for (let i = 0; i < this.choices.length; i++)
      for (let j = i + 1; j < this.choices.length; j++)
        for (let k = j + 1; k < this.choices.length; k++)
          if (this.choices[i] + this.choices[j] + this.choices[k] === 15)
            return [this.choices[i], this.choices[j], this.choices[k]]
    return false
  }

  onChoose(choice: Choice) {
    if (!this.oponent) return
    if (this.turn) throw new WrongTurnException()
    //if (!this.game.isAvailable(choice)) throw new ChoiceUnavailableException()
    if (this.result) throw new GameFinishedException()

    this.choices.push(choice)
  }

  onReady() {
    if (this.ready) return

    if (this.oponent.ready) {
      this.timer
    }
  }

  //**Inicia uma partida contra o jogador definido em que o player atual é o primeiro a jogar. */
  confront(player: PlayerHandler) {
    this.oponent = player
    player.oponent = this
  }
}
