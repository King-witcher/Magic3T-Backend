import { Socket } from 'socket.io'
import { PlayerHandler } from './player'
import { v4 } from 'uuid'

export class Match {
  id: string = v4()
  players: Record<string, PlayerHandler> = {}
  //**Ids dos jogadores. O primeiro id é sempre o id do jogador que começa. */
  ids: [string, string]

  constructor() {
    const player1 = new PlayerHandler({ timeLimit: 90 })
    const player2 = new PlayerHandler({ timeLimit: 90 })
    player1.setOponent(player2)

    const [first, second] = (this.ids = [v4(), v4()])
    this.players[first] = player1
    this.players[second] = player2
  }

  getPlayer(id: string) {
    return this.players[id] || null
  }

  subscribeSpectator(socket: Socket) {}
}
