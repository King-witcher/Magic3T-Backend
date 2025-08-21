import {
  Inject,
  Logger,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'

import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'
import { SocketsService } from '@/common'
import { WsFilter } from '@/common/filters/ws.filter'
import {
  BotName,
  QueueServerEvents,
  QueueServerEventsMap,
} from '@magic3t/types'
import { GameModePipe } from './pipes/game-mode.pipe'
import { QueueInterceptor } from './queue.interceptor'
import { QueueService } from './queue.service'
import { QueueServer, QueueSocket } from './types'

@UseGuards(AuthGuard)
@UseInterceptors(QueueInterceptor)
@UseFilters(WsFilter)
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(QueueGateway.name, { timestamp: true })

  @WebSocketServer()
  server: QueueServer

  constructor(
    private queueService: QueueService,
    @Inject('QueueSocketsService')
    private queueSocketsService: SocketsService<QueueServerEventsMap>
  ) {
    // Counts how many users are online and update everyone
    setInterval(() => {
      const queueCount = this.queueService.getUserCount()
      this.server.emit(QueueServerEvents.UserCount, {
        casual: {
          inGame: Number.NaN,
          queue: queueCount.casual,
        },
        connected: this.queueSocketsService.getUserCount(),
        ranked: {
          inGame: Number.NaN,
          queue: queueCount.ranked,
        },
      })
    }, process.env.QUEUE_STATUS_POLLING_RATE || 2000)
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
    @MessageBody(GameModePipe) mode: 'ranked' | 'casual'
  ) {
    this.queueService.dequeue(userId, mode)
  }

  handleDisconnect(client: QueueSocket) {
    const userId = client.data.userId
    if (userId) {
      this.logger.log(`user ${userId} disconnected`)
      this.queueService.dequeue(userId)
      this.queueSocketsService.remove(userId, client)
    }
  }
}
