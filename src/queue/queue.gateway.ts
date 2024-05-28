import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { MatchService } from '../match/services/match.service'
import { Inject, UseGuards } from '@nestjs/common'
import { Uid } from './decorators/currentUser.decorator'
import { QueueGuard } from './queue.guard'
import { QueueEmitType, QueueServer, QueueSocket } from './types/QueueSocket'
import { QueueService } from './queue.service'
import { SocketsService } from '../common/services/sockets.service'
import { BotName } from '@/database/config/models'

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
    if (!this.matchService.isAvailable(uid)) {
      console.error(`Player "${uid}" unavailable for queue: in game.`)
      this.queueSocketsService.emit(uid, 'queueRejected')
      return
    }

    this.queueService.enqueue(uid, 'casual')

    const userQueueModes = this.queueService.getQueueModes(uid)
    this.queueSocketsService.emit(uid, 'queueModes', userQueueModes)

    console.log(`Player "${uid}" enqueued on casual mode.`)
    this.queueSocketsService.emit(uid, 'queueAcepted', { mode: 'casual' })
  }

  @SubscribeMessage('ranked')
  handleRanked(@Uid() uid: string) {
    if (!this.matchService.isAvailable(uid)) {
      console.error(`Player "${uid}" unavailable for queue: in game.`)
      this.queueSocketsService.emit(uid, 'queueRejected')
      return
    }

    this.queueService.enqueue(uid, 'ranked')

    const userQueueModes = this.queueService.getQueueModes(uid)
    this.queueSocketsService.emit(uid, 'queueModes', userQueueModes)

    console.log(`User "${uid}" enqueued on ranked mode.`)
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

    console.log(`User "${uid}" dequeued from mode "${message}".`)
  }

  handleDisconnect(client: QueueSocket) {
    const { uid } = client.data
    if (uid) {
      this.queueService.dequeue(uid)
      this.queueSocketsService.remove(uid, client)
    }
  }
}
