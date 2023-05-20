import { timeout } from 'rxjs'
import { GameEvent } from './GameEvent'
import { Player, PlayerReport } from './Player'

const InitialTime = 120 * 1000

export interface GameReport {
  player: PlayerReport
  oponent: PlayerReport
  turn: 'player' | 'oponent' | null
  finished: boolean
  result: 'victory' | 'defeat' | 'draw' | null
}

export class Game {
  readonly players: { [playerId: string]: Player } = {}
  readonly firstPlayer: Player
  events: GameEvent[] = []
  turn: {
    player: Player
    turnStartTime: number
    timeout: NodeJS.Timeout
  } | null = null
  finished: boolean = false
  winner: Player | null = null

  constructor([player1, player2]: [Player, Player]) {
    player1.assignOponent(player2)
    player1.remainingTime = InitialTime
    player2.remainingTime = InitialTime

    const random = Math.random()
    if (random < 0.5) this.firstPlayer = player1
    else this.firstPlayer = player2

    this.players[player1.playerId] = player1
    this.players[player2.playerId] = player2
  }

  start() {
    const timeout = setTimeout(() => {
      this.handleTimeOut.bind(this)(this.firstPlayer.playerId)
    }, this.firstPlayer.remainingTime)

    this.turn = {
      player: this.firstPlayer,
      turnStartTime: Date.now(),
      timeout,
    }
  }

  handleTimeOut(playerId: string) {
    const player = this.players[playerId]
    player.remainingTime = 0
    this.finished = true
    this.winner = player.oponent
    this.turn = null
  }

  updateGameTime() {
    if (!this.turn) return
    const wastedTime = Date.now() - this.turn.turnStartTime
    const remaining = this.turn.player.remainingTime - wastedTime

    if (remaining <= 0) {
      this.finished = true
      this.winner = this.turn.player.oponent
      this.turn = null
    }
  }

  getStateReport(playerId: string): GameReport {
    const player = this.players[playerId]
    const oponent = player.oponent

    this.updateGameTime()

    if (!this.turn) {
      // Partida finalizada
      if (this.finished) {
        return {
          finished: true,
          oponent: oponent.getStateReport(),
          player: player.getStateReport(),
          result:
            this.winner === player
              ? 'victory'
              : this.winner === null
              ? 'draw'
              : 'defeat',
          turn: null,
        }

        // Partida não iniciada
      } else {
        return {
          player: player.getStateReport(),
          oponent: oponent.getStateReport(),
          finished: false,
          result: null,
          turn: null,
        }
      }
    }

    // Partida rodando
    return {
      turn: this.turn.player === player ? 'player' : 'oponent',
      oponent: oponent.getStateReport(),
      player: player.getStateReport(),
      finished: false,
      result: null,
    }
  }

  isValidChoice(number: number) {
    for (const playerId of Object.keys(this.players))
      if (this.players[playerId].hasNumber(number)) return false

    if (number < 1 || number > 9) return false

    if (!Number.isInteger(number)) return false

    return true
  }

  setChoice(playerId: string, choice: number) {
    this.players[playerId].push(choice)
  }

  private addEvent(event: GameEvent) {}
}
