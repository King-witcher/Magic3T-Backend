import { Socket } from 'socket.io'
import { Player } from './Player'
import { v4 } from 'uuid'
import { PlayerData } from '../../queue/models/PlayerData'
import { MatchConfig } from './MatchConfig'

interface MatchParams {
  firstPlayer: PlayerData
  secondPlayer: PlayerData
  config: MatchConfig
  onFinish?: () => void // initial
}

export class Match {
  id: string = v4()
  config: MatchConfig
  players: Record<string, Player> = {}

  constructor({ firstPlayer, secondPlayer, config, onFinish }: MatchParams) {
    this.config = config

    console.log(firstPlayer, secondPlayer)

    const player1 = new Player({
      profile: firstPlayer,
      match: this,
    })
    const player2 = new Player({
      profile: secondPlayer,
      match: this,
    })

    player1.setOponent(player2)

    this.players[firstPlayer.uid] = player1
    this.players[secondPlayer.uid] = player2
  }

  getPlayer(id: string) {
    return this.players[id] || null
  }

  emitState() {
    for (const uid of Object.keys(this.players)) {
      this.players[uid].emitState()
    }
  }

  subscribeSpectator(socket: Socket) {}
}
