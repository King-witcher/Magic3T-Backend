import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'

@WebSocketGateway({ cors: '*' })
export class AppGateway {
  @SubscribeMessage('ping')
  handlePing(@MessageBody() body: unknown, @ConnectedSocket() client: Socket) {
    client.emit('pong', body)
  }
}
