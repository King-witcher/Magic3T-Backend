import Timer from 'src/lib/Timer'
import { Choice } from 'src/lib/Player'
import {
  ChoiceUnavailableException,
  GameFinishedException,
  WrongTurnException,
} from './game.exceptions'
import { PlayerResult as PlayerResult } from './game.types'
import { Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { GameState, GameStatus } from 'src/constants/types'
import { log } from 'console'

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
    this.timer = new Timer(timeLimit * 1000, this.handleTimeout.bind(this)) // Possível erro de bind
    this.oponent = this
  }

  handleTimeout() {
    if (this.result) return

    this.oponent.result = PlayerResult.Victory
    this.result = PlayerResult.Defeat
    this.oponent.turn = false
    this.turn = false
    this.emitState()
    this.oponent.emitState()
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

  handleChoice(choice: Choice) {
    if (!this.oponent) return
    if (!this.turn) return this.emitState()
    if ([...this.choices, ...this.oponent.choices].includes(choice as Choice))
      return this.emitState()
    if (choice % 1 !== 0 || choice < 1 || choice > 9) return
    if (this.result) return this.emitState()

    this.choices.push(choice as Choice)

    const triple = this.isWinner() // optimizável

    if (triple) {
      // O jogador venceu a partida
      this.timer.pause()
      this.turn = false
      this.result = PlayerResult.Victory
      this.oponent.result = PlayerResult.Defeat
    } else {
      if (this.choices.length + this.oponent.choices.length === 9) {
        // Partida empatou
        this.timer.pause()
        this.turn = false
        this.result = this.oponent.result = PlayerResult.Draw
      } else {
        // Partida seguiu normalmente
        this.flipTurns()
      }
    }
  }

  flipTurns() {
    if (this.turn) return this.oponent.flipTurns()
    this.oponent.timer.pause()
    this.turn = this.oponent.turn
    this.oponent.turn = false
    if (this.turn) this.timer.start()
  }

  emitState() {
    this.socket?.emit('gameState', JSON.stringify(this.getState()))
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
