import { Inject, Logger, UseFilters, UseGuards } from '@nestjs/common'
import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'

import { WsQueueGuard } from './guards/ws-queue.guard'
import { QueueEmitType, QueueServer, QueueSocket } from './types'
import { SocketsService } from '@/common'
import { QueueService } from './queue.service'
import { WsUserId } from './decorators'
import { BotName } from '@/database'
import { WsFilter } from '@/common/filters/ws.filter'
import { GameModePipe } from './pipes/game-mode.pipe'

@UseFilters(WsFilter)
@UseGuards(WsQueueGuard)
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(QueueGateway.name, { timestamp: true })

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
  async handleFairBot(@WsUserId() userId: string) {
    await this.queueService.createFairBotMatch(userId)
  }

  @SubscribeMessage('bot-0')
  async handleBot0(@WsUserId() uid: string) {
    await this.queueService.createBotMatch(uid, BotName.Bot0)
  }

  @SubscribeMessage('bot-1')
  async handleBot1(@WsUserId() uid: string) {
    await this.queueService.createBotMatch(uid, BotName.Bot1)
  }

  @SubscribeMessage('bot-2')
  async handleBot2(@WsUserId() uid: string) {
    await this.queueService.createBotMatch(uid, BotName.Bot2)
  }

  @SubscribeMessage('bot-3')
  async handleBot3(@WsUserId() uid: string) {
    await this.queueService.createBotMatch(uid, BotName.Bot3)
  }

  @SubscribeMessage('casual')
  handleCasual(@WsUserId() uid: string) {
    this.queueService.enqueue(uid, 'casual')
  }

  @SubscribeMessage('ranked')
  handleRanked(@WsUserId() uid: string) {
    this.queueService.enqueue(uid, 'ranked')
  }

  @SubscribeMessage('dequeue')
  handleDequeue(
    @WsUserId() userId: string,
    @MessageBody(GameModePipe) mode: 'ranked' | 'casual',
  ) {
    this.queueService.dequeue(userId, mode)
  }

  handleDisconnect(client: QueueSocket) {
    const { uid } = client.data
    if (uid) {
      this.logger.log(`user ${uid} disconnected`)
      this.queueService.dequeue(uid)
      this.queueSocketsService.remove(uid, client)
    }
  }
}
