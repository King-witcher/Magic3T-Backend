import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { GameService } from '../game/game.service'
import { Logger } from '@nestjs/common'

// Versão simplificada
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  pendingPlayer: Socket | null = null

  constructor(private gameService: GameService) {}

  @SubscribeMessage('enqueue')
  handleEnqueue(client: Socket) {
    Logger.log(`Player enqueued.`, 'QueueGateway')

    if (this.pendingPlayer) {
      const [id1, id2] = this.gameService.createGame()
      this.pendingPlayer.emit('matchFound', id1)
      this.pendingPlayer.disconnect()
      client.emit('matchFound', id2)
      client.disconnect()
      this.pendingPlayer = null
    } else this.pendingPlayer = client
  }

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {
    Logger.log(`Player leaved queue.`, 'QueueGateway')
    if (this.pendingPlayer === client) this.pendingPlayer = null
  }
}
