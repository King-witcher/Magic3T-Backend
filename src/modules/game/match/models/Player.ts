import Timer from 'src/lib/Timer'
import { PlayerStatus } from './PlayerStatus'
import { Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { Choice } from './Choice'
import { PlayerData as PlayerProfile } from '../../queue/models/PlayerData'
import { Match } from './Match'
import { GameState as POVGameState } from './POVGameState'

interface PlayerParams {
  profile: PlayerProfile
  match: Match
}

type PlayerState = {
  choices: Choice[]
  timer: Timer
  readyTimeout: NodeJS.Timeout
  ready: boolean
} & (
  | {
      turn: boolean
      forfeit: false
    }
  | {
      turn: false
      forfeit: true
    }
)

export class Player {
  profile: PlayerProfile
  match: Match
  socket: Socket | null = null
  oponent: Player
  state: PlayerState

  constructor({ profile, match }: PlayerParams) {
    this.profile = profile
    this.match = match
    this.oponent = this

    const readyTimeout = setTimeout(
      this.forfeit.bind(this),
      match.config.readyTimeout
    )

    this.state = {
      timer: new Timer(match.config.timelimit, this.handleTimeout.bind(this)),
      choices: [],
      forfeit: false,
      ready: false,
      turn: false,
      readyTimeout,
    }
  }

  getStatus(): PlayerStatus {
    // Forfeit
    if (this.state.forfeit) return PlayerStatus.Defeat
    if (this.oponent.state.forfeit) return PlayerStatus.Victory

    // Timeout
    if (this.state.timer.getRemaining() === 0) return PlayerStatus.Defeat
    if (this.oponent.state.timer.getRemaining() === 0)
      return PlayerStatus.Victory

    // Choices
    if (this.isWinner()) return PlayerStatus.Victory
    if (this.oponent.isWinner()) return PlayerStatus.Defeat
    if (this.state.choices.length + this.oponent.state.choices.length === 9)
      return PlayerStatus.Draw

    // Waiting the game to start
    if (!this.state.ready || !this.oponent.state.ready)
      return PlayerStatus.Waiting

    // Playing
    return PlayerStatus.Playing
  }

  getState(): POVGameState {
    return {
      playerChoices: this.state.choices,
      oponentChoices: this.oponent.state.choices,
      status: this.getStatus(),
      oponentTimeLeft: this.oponent.state.timer.getRemaining(),
      playerTimeLeft: this.state.timer.getRemaining(),
      turn: this.state.turn,
    }
  }

  handleTimeout() {
    // if (this.getResult() !== null) return
    // this.oponent.state.timer.pause()
    this.oponent.state.turn = this.state.turn = false
    this.emitState()
    this.oponent.emitState()
  }

  //** Retorna um array com 3 Choices se o jogador for vencedor; caso contrário, false. */
  isWinner(): [Choice, Choice, Choice] | false {
    const choices = this.state.choices
    for (let i = 0; i < choices.length; i++)
      for (let j = i + 1; j < choices.length; j++)
        for (let k = j + 1; k < choices.length; k++)
          if (choices[i] + choices[j] + choices[k] === 15)
            return [choices[i], choices[j], choices[k]]
    return false
  }

  onReady() {
    if (this.state.ready) return

    clearTimeout(this.state.readyTimeout)
    this.state.ready = true

    // Starts the game respecting the preset turn. If no turn was set, sets the first player randomly.
    if (this.oponent.state.ready) {
      if (this.state.turn) {
        this.state.timer.start()
      } else if (this.oponent.state.turn) {
        this.oponent.state.timer.start()
      } else {
        Logger.log('Randomly setting turns.', 'PlayerHandler')
        const rand = Math.random()
        if (rand <= 0.5) {
          this.state.turn = true
          this.state.timer.start()
        } else {
          this.oponent.state.turn = true
          this.oponent.state.timer.start()
        }
      }
      Logger.log('Game started', 'PlayerHandler')
    }
  }

  onChoose(choice: Choice) {
    if (!this.oponent) return
    if (!this.state.turn) return this.emitState()
    if ([...this.state.choices, ...this.oponent.state.choices].includes(choice))
      return this.emitState()
    if (choice % 1 !== 0 || choice < 1 || choice > 9) return
    if (this.getStatus() !== PlayerStatus.Playing) return this.emitState()
    if (!this.state.ready || !this.oponent.state.ready) return this.emitState()

    this.state.choices.push(choice as Choice)

    const triple = this.isWinner() // optimizável

    if (triple) {
      // O jogador venceu a partida
      this.state.timer.pause()
      this.state.turn = false
    } else {
      if (this.state.choices.length + this.state.choices.length === 9) {
        // Partida empatou
        this.state.timer.pause()
        this.state.turn = false
      } else {
        // Partida seguiu normalmente
        this.flipTurns()
      }
    }
  }

  flipTurns() {
    if (this.state.turn) return this.oponent.flipTurns()
    this.oponent.state.timer.pause()
    this.state.turn = this.oponent.state.turn
    this.oponent.state.turn = false
    if (this.state.turn) this.state.timer.start()
  }

  emitState() {
    this.socket?.emit('gameState', JSON.stringify(this.getState())) // pq esse stringify?
  }

  forfeit() {
    if (this.getStatus()) return

    this.state.turn = this.oponent.state.turn = false
    this.state.timer.pause()
    this.oponent.state.timer.pause()
    this.emitState()
    this.oponent.emitState()
  }

  //**Inicia uma partida contra o jogador definido em que o player atual é o primeiro a jogar. */
  setOponent(player: Player) {
    this.oponent = player
    player.oponent = this
  }

  static setOponents(player1: Player, player2: Player) {
    player1.oponent = player2
    player2.oponent = player1
  }
}
