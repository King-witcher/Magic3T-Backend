import { UseFilters } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { WsFilter } from './common/filters/ws.filter'
import { Socket } from 'socket.io'

@UseFilters(WsFilter)
@WebSocketGateway({ cors: '*' })
export class AppGateway {
  @SubscribeMessage('ping')
  handlePing(@MessageBody() body: unknown, @ConnectedSocket() client: Socket) {
    client.emit('pong', body)
  }
}
