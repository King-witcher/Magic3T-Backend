import { Player } from './Player'
import { v4 } from 'uuid'
import { PlayerProfile } from '../../queue/models/PlayerProfile'
import { MatchConfig } from './MatchConfig'
import { MatchRegistry as MoveHistory } from './MatchRegistry'
import { firestore } from '@/modules/firebase/firebase.module'
import { PlayerStatus } from './PlayerStatus'

export interface MatchParams {
  white: PlayerProfile
  black: PlayerProfile
  config: MatchConfig
}

const ratingVariation = 40

export class Match {
  finished = false
  id: string = v4()
  config: MatchConfig
  players: Record<string, Player> = {}
  white: Player
  black: Player
  history: MoveHistory

  constructor({ white, black, config }: MatchParams) {
    this.config = config

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
      mode: config.ranked ? 'ranked' : 'casual',
      moves: [],
      winner: 'none',
      timestamp: new Date(),
    }
  }

  getPlayer(id: string) {
    return this.players[id] || null
  }

  getTime(): number {
    return 2 * this.config.timelimit - this.white.state.timer.getRemaining() - this.black.state.timer.getRemaining()
  }

  emitState() {
    for (const uid of Object.keys(this.players)) {
      this.players[uid].emitState()
    }
  }

  async handleFinish() {
    if (this.finished) return
    this.finished = true

    const history = this.history
    const white = history.white
    const black = history.black

    const whiteStatus = this.white.getStatus()

    const statusMap: Record<string, 'white' | 'black' | 'none'> = {
      victory: 'white',
      defeat: 'black',
      draw: 'none',
    }

    history.winner = statusMap[whiteStatus]

    // Saves the match in the history.
    const historyPromise = firestore.collection('matches').doc(this.id).create(history)

    // Calculate and update ratings, if the match is ranked
    if (this.config.ranked) {
      const pWhite = 1 / (1 + Math.pow(10, (black.rating - white.rating) / 400))
      const whiteGain =
        whiteStatus === PlayerStatus.Victory
          ? (1 - pWhite) * ratingVariation // Victory
          : whiteStatus === PlayerStatus.Defeat
          ? -pWhite * ratingVariation // Defeat
          : (0.5 - pWhite) * ratingVariation // Draw

      white.rv = whiteGain
      black.rv = -whiteGain

      await Promise.all([
        firestore
          .collection('users')
          .doc(white.uid)
          .update({ rating: white.rating + whiteGain }),
        firestore
          .collection('users')
          .doc(black.uid)
          .update({ rating: black.rating - whiteGain }),
      ])
    }

    await historyPromise
  }
}
