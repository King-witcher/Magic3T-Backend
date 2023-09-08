import { HttpException } from '@nestjs/common'
import { Choice, Player, PlayerReport } from './Player'

const Timelimit = 120 * 1000

interface MessageReport {
  player: 'player' | 'oponent'
  content: string
  time: number
}

export interface GameReport {
  player: PlayerReport
  oponent: PlayerReport
  turn: 'player' | 'oponent' | null
  finished: boolean
  result: 'victory' | 'defeat' | 'draw' | null
  triple: [Choice, Choice, Choice] | null
  chat: MessageReport[]
}

interface GameParams {
  player1: {
    nickname: string | null
    rating: number | null
  }
  player2: {
    nickname: string | null
    rating: number | null
  }
  timelimit: number
}

export class Game {
  readonly playerMap: { [playerId: string]: Player } = {}
  readonly player1: Player
  readonly player2: Player
  readonly firstPlayer: Player
  turn: Player | null = null
  finished: boolean = false
  winner: Player | null = null
  triple: [Choice, Choice, Choice] | null = null
  messages: { player: Player; content: string; time: number }[] = []

  constructor({ player1: p1, player2: p2, timelimit }: GameParams) {
    const player1 = (this.player1 = new Player(
      p1.nickname,
      p1.rating,
      timelimit
    ))
    const player2 = (this.player2 = new Player(
      p2.nickname,
      p2.rating,
      timelimit
    ))
    player1.timer.timeoutCallback = () => {
      this.handleTimeout.bind(this)(player1)
    }
    player2.timer.timeoutCallback = () => {
      this.handleTimeout.bind(this)(player2)
    }
    Player.setOponents(player1, player2)

    // Define um jogador inicial aleatoriamente
    const random = Math.random()
    if (random < 0.5) this.firstPlayer = player1
    else this.firstPlayer = player2

    // Insere os jogadores no mapa
    this.playerMap[player1.token] = player1
    this.playerMap[player2.token] = player2
  }

  start() {
    this.turn = this.firstPlayer
    this.turn.timer.start()
  }

  pushMessage(playerId: string, content: string) {
    const player = this.playerMap[playerId]
    this.messages.push({
      player,
      content,
      time: Date.now(),
    })
  }

  flipTurns() {
    if (!this.turn) return
    this.turn.timer.pause()
    this.turn = this.turn.oponent
    this.turn.timer.start()
  }

  handleTimeout(player: Player) {
    this.finished = true
    this.winner = player.oponent
    this.turn = null
  }

  getStateReport(playerId: string): GameReport {
    const player = this.playerMap[playerId]
    const oponent = player.oponent

    const chat: MessageReport[] = this.messages.map((message) => {
      return {
        player: player === message.player ? 'player' : 'oponent',
        time: message.time,
        content: message.content,
      }
    })

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
          triple: this.triple,
          chat,
        }

        // Partida não iniciada
      } else {
        return {
          player: player.getStateReport(),
          oponent: oponent.getStateReport(),
          finished: false,
          result: null,
          turn: null,
          triple: null,
          chat,
        }
      }
    }

    // Partida rodando
    return {
      turn: this.turn === player ? 'player' : 'oponent',
      oponent: oponent.getStateReport(),
      player: player.getStateReport(),
      finished: false,
      result: null,
      triple: null,
      chat,
    }
  }

  isValidChoice(choice: Choice) {
    for (const playerId of Object.keys(this.playerMap))
      if (this.playerMap[playerId].hasChoice(choice)) return false

    if (choice < 1 || choice > 9) return false

    if (!Number.isInteger(choice)) return false

    return true
  }

  setChoice(playerId: string, choice: Choice) {
    const player = this.playerMap[playerId]
    if (this.turn !== player) throw new HttpException('Wrong turn', 400)

    if (player.hasChoice(choice) || player.oponent.hasChoice(choice))
      throw new HttpException('Number already chosen', 400)

    player.addChoice(choice)
    const victory = player.getTriple()
    if (victory) {
      this.winner = player
      this.finished = true
      this.turn.timer.pause()
      this.turn = null
      this.triple = victory
    } else if (player.choices.length + player.oponent.choices.length !== 9)
      this.flipTurns()
    else {
      this.finished = true
      this.turn.timer.pause()
      this.turn = null
    }
  }

  forfeit(playerId: string) {
    if (this.finished) throw new HttpException('Game finished', 400)

    const player = this.playerMap[playerId]

    this.winner = player.oponent
    this.finished = true
    this.turn = null
  }
}
