import { Player } from './Player'
import { GamePlayerProfile } from '../../queue/types/GamePlayerProfile'
import { getNewRatings } from '@/lib/Glicko'
import { models } from '@/firebase/models'
import { MatchRegistry } from '@/firebase/models/matches/MatchRegistry'
import Publisher from '@/lib/Publisher'
import { getId } from '@/lib/GetId'
import { FieldValue, UpdateData } from 'firebase-admin/firestore'
import { User } from '@/firebase/models/users/User'

export type ForfeitSchedule = {
  player: Player
  nodeTimeout: NodeJS.Timeout
}

export interface MatchConfig {
  timelimit: number
  isRanked: boolean
  /** Amount of time after which the match will be cancelled if both players didn't ready. If one player has set ready, the match is considered a win for this player. */
  readyTimeout: number
}

export interface MatchParams {
  white: GamePlayerProfile
  black: GamePlayerProfile
  config: MatchConfig
}

export class Match extends Publisher<'onFinish'> {
  finished = false
  id: string = getId(28)
  config: MatchConfig
  playerMap: Record<string, Player> = {}
  white: Player
  black: Player
  history: MatchRegistry
  readyTimeout: NodeJS.Timeout

  constructor({ white, black, config }: MatchParams) {
    super()
    this.config = config

    const whitePlayer = (this.white = new Player({
      profile: white,
      match: this,
      side: 'white',
    }))

    const blackPlayer = (this.black = new Player({
      profile: black,
      match: this,
      side: 'black',
    }))

    this.readyTimeout = setTimeout(() => {
      this.black.onReady()
      this.white.onReady()
      // if (this.black.state.ready && this.white.state.ready) return
      // else if (this.black.state.ready) this.white.forfeit()
      // else if (this.white.state.ready) this.black.forfeit()
      // else {
      //   const time = this.getCurrentTime()
      //   this.history.moves.push({
      //     move: 'timeout',
      //     player: 'black',
      //     time,
      //   })
      //   this.history.moves.push({
      //     move: 'timeout',
      //     player: 'white',
      //     time,
      //   })
      //   this.history.winner = 'none'
      //   this.processResult()
      // }
    }, config.readyTimeout)

    whitePlayer.setOponent(blackPlayer)

    this.playerMap[white.uid] = whitePlayer
    this.playerMap[black.uid] = blackPlayer

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
      mode: config.isRanked ? 'ranked' : 'casual',
      moves: [],
      winner: 'none',
      timestamp: new Date(),
    }
  }

  getPlayer(id: string) {
    return this.playerMap[id] || null
  }

  getCurrentTime(): number {
    return (
      2 * this.config.timelimit -
      this.white.state.timer.remaining -
      this.black.state.timer.remaining
    )
  }

  emitState() {
    for (const uid of Object.keys(this.playerMap)) {
      this.playerMap[uid].emitState()
    }
  }

  async handleFinish() {
    if (this.finished) return
    this.finished = true

    const history = this.history

    const whiteStatus = this.white.getStatus()

    const statusMap: Record<string, 'white' | 'black' | 'none'> = {
      victory: 'white',
      defeat: 'black',
      draw: 'none',
    }

    history.winner = statusMap[whiteStatus]
    await this.processResult()
    this.publish('onFinish')
  }

  // REFACT!
  async processResult() {
    const white = this.white
    const black = this.black

    const whiteUpdate: UpdateData<User> = {}
    const blackUpdate: UpdateData<User> = {}

    switch (this.history.winner) {
      case 'white':
        whiteUpdate['stats.wins'] = FieldValue.increment(1)
        blackUpdate['stats.defeats'] = FieldValue.increment(1)
        break
      case 'black':
        whiteUpdate['stats.defeats'] = FieldValue.increment(1)
        blackUpdate['stats.wins'] = FieldValue.increment(1)
        break
      case 'none':
        whiteUpdate['stats.draws'] = FieldValue.increment(1)
        blackUpdate['stats.draws'] = FieldValue.increment(1)
        break
    }

    if (this.config.isRanked) {
      const whiteResult =
        this.history.winner === 'white'
          ? 1
          : this.history.winner === 'black'
          ? 0
          : 0.5

      const [whiteGlicko, blackGlicko] = await getNewRatings(
        this.white.profile.glicko,
        this.black.profile.glicko,
        whiteResult,
      )

      const whiteRV = (this.history.white.rv =
        whiteGlicko.rating - white.profile.glicko.rating)
      const blackRV = (this.history.black.rv =
        blackGlicko.rating - black.profile.glicko.rating)

      whiteUpdate.glicko = whiteGlicko
      blackUpdate.glicko = blackGlicko

      this.white.channel.sendRatingsVariation({
        player: whiteRV,
        oponent: blackRV,
      })
      this.black.channel.sendRatingsVariation({
        player: blackRV,
        oponent: whiteRV,
      })
    }

    await Promise.all([
      models.matches.save(this.history),
      models.users.collection.doc(black.profile.uid).update(blackUpdate),
      models.users.collection.doc(white.profile.uid).update(whiteUpdate),
    ])
  }
}
