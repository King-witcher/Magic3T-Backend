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
    return {
      playerChoices: this.choices,
      oponentChoices: this.oponent.choices,
      gameStatus: GameStatus.Ongoing,
      oponentTimeLeft: 9999999,
      playerTimeLeft: 9999999,
      turn: this.turn,
    }
  }

  //**Inicia uma partida contra o jogador definido em que o player atual é o primeiro a jogar. */
  confront(player: PlayerHandler) {
    this.oponent = player
    player.oponent = this
  }
}
