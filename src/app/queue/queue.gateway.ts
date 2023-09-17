import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { GameService } from '../game/game.service'

// Versão simplificada
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  pendingPlayer: Socket | null = null

  constructor(private gameService: GameService) {}

  handleConnection(client: Socket) {
    if (!this.pendingPlayer) this.pendingPlayer = client

    if (this.pendingPlayer) {
      const [id1, id2] = this.gameService.createGame()
      this.pendingPlayer.emit('matchFound', id1)
      this.pendingPlayer.disconnect()
      client.emit('matchfound', id2)
      client.disconnect()
      this.pendingPlayer = null
    }
  }

  handleDisconnect(client: Socket) {
    if (this.pendingPlayer === client) this.pendingPlayer = null
  }
}
