import { HttpStatus, Inject, UseFilters, UseGuards } from '@nestjs/common'
import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'

import { QueueGuard } from './queue.guard'
import { MatchService } from '@/match'
import { QueueEmitType, QueueServer, QueueSocket } from './types'
import { SocketsService } from '@/common'
import { QueueService } from './queue.service'
import { Uid } from './decorators'
import { BotName, UsersService } from '@/database'
import { WsFilter } from '@/common/filters/ws.filter'
import { BaseError } from '@/common/errors/base-error'

@UseGuards(QueueGuard)
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: QueueServer

  constructor(
    private matchService: MatchService,
    private queueService: QueueService,
    @Inject('QueueSocketsService')
    private queueSocketsService: SocketsService<QueueEmitType>,
    private usersService: UsersService,
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
  async handleFairBot(@Uid() userId: string) {
    await this.queueService.createFairBotMatch(userId)
  }

  @SubscribeMessage('bot-0')
  async handleBot0(@Uid() uid: string) {
    await this.queueService.createBotMatch(uid, BotName.Bot0)
  }

  @SubscribeMessage('bot-1')
  async handleBot1(@Uid() uid: string) {
    await this.queueService.createBotMatch(uid, BotName.Bot1)
  }

  @SubscribeMessage('bot-2')
  async handleBot2(@Uid() uid: string) {
    await this.queueService.createBotMatch(uid, BotName.Bot2)
  }

  @SubscribeMessage('bot-3')
  async handleBot3(@Uid() uid: string) {
    await this.queueService.createBotMatch(uid, BotName.Bot3)
  }

  @SubscribeMessage('casual')
  handleCasual(@Uid() uid: string) {
    this.queueService.enqueue(uid, 'casual')
    this.queueSocketsService.emit(uid, 'queueAcepted', { mode: 'casual' })
  }

  @SubscribeMessage('ranked')
  @UseFilters(WsFilter)
  handleRanked(@Uid() uid: string) {
    this.queueService.enqueue(uid, 'ranked')
    this.queueSocketsService.emit(uid, 'queueAcepted', { mode: 'ranked' })
  }

  @SubscribeMessage('dequeue')
  handleDequeue(
    @Uid() uid: string,
    @MessageBody() message: 'ranked' | 'casual',
  ) {
    this.queueService.dequeue(uid, message)

    const userQueueModes = this.queueService.getQueueModes(uid)
    this.queueSocketsService.emit(uid, 'queueModes', userQueueModes)

    // console.log(`User "${uid}" dequeued from mode "${message}".`)
  }

  handleDisconnect(client: QueueSocket) {
    const { uid } = client.data
    if (uid) {
      this.queueService.dequeue(uid)
      this.queueSocketsService.remove(uid, client)
    }
  }
}
