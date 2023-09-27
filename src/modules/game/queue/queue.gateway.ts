import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { MatchService } from '../match/match.service'
import { Inject, Logger } from '@nestjs/common'
import { AuthStrategy } from './strategies/AuthStrategy'

// Versão simplificada
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  pendingSocket: Socket | null = null

  constructor(
    private matchService: MatchService,
    private authStrategy: AuthStrategy,
    @Inject('GAME_MODE_CONFIG') private gameModeConfig: any
  ) {}

  handleConnection(@ConnectedSocket() socket: Socket) {
    if (!this.authStrategy.validate(socket)) {
      socket.disconnect()
      Logger.error('Queue connection rejected', 'QueueGateway')
    }
  }

  @SubscribeMessage('enqueue')
  handleEnqueue(client: Socket) {
    Logger.log(`Player enqueued`, 'QueueGateway')

    if (this.pendingSocket) {
      //Logger.log('Match found', 'QueueGateway')
      const match = this.matchService.createMatch()
      const [key1, key2] = match.ids

      this.pendingSocket.emit('matchFound', {
        matchId: match.id,
        playerKey: key1,
      })
      this.pendingSocket.disconnect()

      client.emit('matchFound', {
        matchId: match.id,
        playerKey: key2,
      })
      client.disconnect()

      this.pendingSocket = null
    } else this.pendingSocket = client
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Player leaved queue`, 'QueueGateway')
    if (this.pendingSocket === client) this.pendingSocket = null
  }
}
