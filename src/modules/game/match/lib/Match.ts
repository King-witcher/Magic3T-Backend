import { Player } from './Player'
import { v4 } from 'uuid'
import { PlayerProfile } from '../../queue/models/PlayerProfile'
import { getNewRatings } from '@/lib/Glicko'
import { models } from '@/firebase/models'
import { MatchRegistry } from '@/firebase/models/matches/MatchRegistry'

export type ForfeitSchedule = {
  player: Player
  nodeTimeout: NodeJS.Timeout
}

export interface MatchConfig {
  timelimit: number
  ranked: boolean
  readyTimeout: number
}

export interface MatchParams {
  white: PlayerProfile
  black: PlayerProfile
  config: MatchConfig
}

export class Match {
  finished = false
  id: string = v4()
  config: MatchConfig
  players: Record<string, Player> = {}
  white: Player
  black: Player
  history: MatchRegistry

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
      _id: this.id,
      black: {
        uid: black.uid,
        name: black.name,
        rating: black.glicko.rating,
        rv: 0,
      },
      white: {
        uid: white.uid,
        name: white.name,
        rating: white.glicko.rating,
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
    const white = this.white
    const black = this.black

    const whiteStatus = this.white.getStatus()

    const statusMap: Record<string, 'white' | 'black' | 'none'> = {
      victory: 'white',
      defeat: 'black',
      draw: 'none',
    }

    history.winner = statusMap[whiteStatus]

    // Saves the match in the history.
    const historyPromise = models.matches.save(this.history)

    // Calculate and update ratings, if the match is ranked
    if (this.config.ranked) {
      const whiteResult = this.history.winner === 'white' ? 1 : this.history.winner === 'black' ? 0 : 0.5

      const [whiteRating, blackRating] = getNewRatings(
        this.white.profile.glicko,
        this.black.profile.glicko,
        whiteResult,
      )

      this.history.white.rv = whiteRating.rating - white.profile.glicko.rating
      this.history.black.rv = blackRating.rating - black.profile.glicko.rating

      await Promise.all([
        models.users.updateGlicko(white.profile.uid, whiteRating),
        models.users.updateGlicko(black.profile.uid, blackRating),
      ])
    }

    await historyPromise
  }
}
