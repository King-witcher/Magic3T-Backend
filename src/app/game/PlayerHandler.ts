import Timer from 'src/lib/Timer'
import { Choice } from 'src/lib/Player'
import { GameFinishedException, WrongTurnException } from './game.exceptions'
import { PlayerResult as PlayerResult } from './game.types'
import { Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { GameState, GameStatus } from 'src/constants/types'

interface PlayerOptions {
  timeLimit: number
}

export class PlayerHandler {
  socket: Socket | null
  choices: Choice[] = []
  timer: Timer
  oponent: PlayerHandler
  ready: boolean = false
  turn: boolean = false
  result: PlayerResult | null

  constructor({ timeLimit }: PlayerOptions) {
    this.timer = new Timer(timeLimit * 1000, () => {}) // Possível erro de bind
    this.oponent = this
  }

  onTimeout() {
    if (this.result) return

    this.oponent.result = PlayerResult.Victory
    this.result = PlayerResult.Defeat
    this.oponent.turn = false
    this.turn = false
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

  onReady() {
    if (this.ready) return

    this.ready = true

    if (this.oponent.ready) {
      const rand = Math.random()
      if (rand <= 0.5) {
        this.turn = true
        this.timer.start()
      } else {
        this.oponent.turn = true
        this.oponent.timer.start()
      }
      Logger.log('Game started.', 'PlayerHandler')
    }
  }

  getState(): GameState {
    let gameStatus = GameStatus.Undefined
    if (this.ready && this.oponent.ready) {
      if (!this.result) gameStatus = GameStatus.Ongoing
      else gameStatus = this.result as unknown as GameStatus
    }

    return {
      playerChoices: this.choices,
      oponentChoices: this.oponent.choices,
      gameStatus,
      oponentTimeLeft: this.oponent.timer.getRemaining(),
      playerTimeLeft: this.timer.getRemaining(),
      turn: this.turn,
    }
  }

  //**Inicia uma partida contra o jogador definido em que o player atual é o primeiro a jogar. */
  setOponent(player: PlayerHandler) {
    this.oponent = player
    player.oponent = this
  }

  static setOponents(player1: PlayerHandler, player2: PlayerHandler) {
    player1.oponent = player2
    player2.oponent = player1
  }
}
