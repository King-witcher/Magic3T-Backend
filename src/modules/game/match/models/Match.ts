import { Player } from './Player'
import { v4 } from 'uuid'
import { PlayerProfile } from '../../queue/models/PlayerProfile'
import { MatchConfig } from './MatchConfig'
import { MatchRegistry as MoveHistory } from './MatchRegistry'

export interface MatchParams {
  white: PlayerProfile
  black: PlayerProfile
  config: MatchConfig
  onFinish?: (history: MoveHistory) => Promise<void> // initial
}

export class Match {
  id: string = v4()
  config: MatchConfig
  players: Record<string, Player> = {}
  white: Player
  black: Player
  history: MoveHistory
  private onFinish?: (history: MoveHistory) => Promise<void>

  constructor({ white, black, config, onFinish }: MatchParams) {
    this.config = config
    this.onFinish = onFinish

    const whitePlayer = new Player({
      profile: white,
      match: this,
      side: 'white',
    })
    this.white = whitePlayer

    const blackPlayer = new Player({
      profile: black,
      match: this,
      side: 'black',
    })
    this.black = blackPlayer

    whitePlayer.setOponent(blackPlayer)

    this.players[white.uid] = whitePlayer
    this.players[black.uid] = blackPlayer

    this.history = {
      black: {
        uid: black.uid,
        name: black.name,
        rating: black.rating,
        rv: 0,
      },
      white: {
        uid: white.uid,
        name: white.name,
        rating: white.rating,
        rv: 0,
      },
      mode: 'casual',
      moves: [],
      winner: 'none',
      timestamp: new Date(),
    }
  }

  getPlayer(id: string) {
    return this.players[id] || null
  }

  getTime(): number {
    return (
      2 * this.config.timelimit -
      this.white.state.timer.getRemaining() -
      this.black.state.timer.getRemaining()
    )
  }

  emitState() {
    for (const uid of Object.keys(this.players)) {
      this.players[uid].emitState()
    }
  }

  handleFinish() {
    const whiteStatus = this.white.getStatus()

    const statusMap: Record<string, 'white' | 'black' | 'none'> = {
      victory: 'white',
      defeat: 'black',
      draw: 'none',
    }

    if (this.onFinish) {
      this.history.winner = statusMap[whiteStatus]
      this.onFinish(this.history)
      // Prevents this function from being called twice
      this.onFinish = undefined
    }
  }
}
