import { Socket } from 'socket.io'
import { Player } from './Player'
import { v4 } from 'uuid'

export class Match {
  id: string = v4()
  players: Record<string, Player> = {}
  //**Ids dos jogadores. O primeiro id é sempre o id do jogador que começa. */
  ids: [string, string]

  constructor() {
    const player1 = new Player({ timeLimit: 90 })
    const player2 = new Player({ timeLimit: 90 })
    player1.setOponent(player2)

    const [first, second] = (this.ids = [player1.id, player2.id])
    this.players[first] = player1
    this.players[second] = player2
  }

  getPlayer(id: string) {
    return this.players[id] || null
  }

  emitState() {
    this.players[this.ids[0]].emitState()
    this.players[this.ids[1]].emitState()
  }

  subscribeSpectator(socket: Socket) {}
}
