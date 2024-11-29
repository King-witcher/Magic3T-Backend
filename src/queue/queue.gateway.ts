import { Inject, UseFilters, UseGuards } from '@nestjs/common'
import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'

import { QueueGuard } from './queue.guard'
import { QueueEmitType, QueueServer, QueueSocket } from './types'
import { SocketsService } from '@/common'
import { QueueService } from './queue.service'
import { UserId } from './decorators'
import { BotName } from '@/database'
import { WsFilter } from '@/common/filters/ws.filter'
import { GameModePipe } from './pipes/game-mode.pipe'

@UseFilters(WsFilter)
@UseGuards(QueueGuard)
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: QueueServer

  constructor(
    private queueService: QueueService,
    @Inject('QueueSocketsService')
    private queueSocketsService: SocketsService<QueueEmitType>,
  ) {
    // Counts how many users are online and update everyone
    setInterval(() => {
      const queueCount = this.queueService.getUserCount()
      this.server.emit('updateUserCount', {
        casual: {
          inGame: NaN,
          queue: queueCount.casual,
        },
        connected: this.queueSocketsService.getUserCount(),
        ranked: {
          inGame: NaN,
          queue: queueCount.ranked,
        },
      })
    }, 2000)
  }

  @SubscribeMessage('interact')
  handleInteract() {
    return
  }

  @SubscribeMessage('fair')
  async handleFairBot(@UserId() userId: string) {
    await this.queueService.createFairBotMatch(userId)
  }

  @SubscribeMessage('bot-0')
  async handleBot0(@UserId() uid: string) {
    await this.queueService.createBotMatch(uid, BotName.Bot0)
  }

  @SubscribeMessage('bot-1')
  async handleBot1(@UserId() uid: string) {
    await this.queueService.createBotMatch(uid, BotName.Bot1)
  }

  @SubscribeMessage('bot-2')
  async handleBot2(@UserId() uid: string) {
    await this.queueService.createBotMatch(uid, BotName.Bot2)
  }

  @SubscribeMessage('bot-3')
  async handleBot3(@UserId() uid: string) {
    await this.queueService.createBotMatch(uid, BotName.Bot3)
  }

  @SubscribeMessage('casual')
  handleCasual(@UserId() uid: string) {
    this.queueService.enqueue(uid, 'casual')
  }

  @SubscribeMessage('ranked')
  handleRanked(@UserId() uid: string) {
    this.queueService.enqueue(uid, 'ranked')
  }

  @SubscribeMessage('dequeue')
  handleDequeue(
    @UserId() userId: string,
    @MessageBody(GameModePipe) mode: 'ranked' | 'casual',
  ) {
    this.queueService.dequeue(userId, mode)
  }

  handleDisconnect(client: QueueSocket) {
    const { uid } = client.data
    if (uid) {
      this.queueService.dequeue(uid)
      this.queueSocketsService.remove(uid, client)
    }
  }
}
