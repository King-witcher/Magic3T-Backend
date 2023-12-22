import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { MatchService } from '../match/match.service'
import { UseGuards } from '@nestjs/common'
import { CurrentUser } from './decorators/currentUser.decorator'
import { GamePlayerProfile } from './types/GamePlayerProfile'
import { QueueGuard } from './queue.guard'
import { QueueServer, QueueSocket } from './types/QueueSocket'
import { QueueService } from './queue.service'
import { SocketsService } from '../sockets.service'
import { LMMBot } from '@/lib/bots/LMMBot'
import { firestore } from 'firebase-admin'
import { database } from '@/firebase/services'

const BOT_TIMELIMIT = 1000 * 60 * 3

@UseGuards(QueueGuard)
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: QueueServer

  botConfig = database.doc('config/bots').get()

  constructor(
    private matchService: MatchService,
    private queueService: QueueService,
    public socketsService: SocketsService,
  ) {
    // Counts how many users are online and update everyone
    setInterval(() => {
      const queueCount = this.queueService.getUserCount()
      this.server.emit('updateUserCount', {
        casual: {
          inGame: NaN,
          queue: queueCount.casual,
        },
        connected: this.socketsService.getUserCount(),
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
  async handleBot0(@CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      this.socketsService.emit(user.uid, 'queueRejected')
      return
    }

    const configSnapshot = await this.botConfig
    const configs = configSnapshot.data()
    if (!configs) return
    const config = configs.bot0

    if (config.model === 'random')
      await this.matchService.createWithRandom(user, BOT_TIMELIMIT, true)
    else if (config.model === 'lmm')
      await this.matchService.createWithLMM(
        user,
        config.depth,
        BOT_TIMELIMIT,
        true,
      )
  }

  @SubscribeMessage('bot-1')
  async handleBot1(@CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      this.socketsService.emit(user.uid, 'queueRejected')
      return
    }

    const configSnapshot = await this.botConfig
    const configs = configSnapshot.data()
    if (!configs) return
    const config = configs.bot1

    console.log(config)

    if (config.model === 'random')
      await this.matchService.createWithRandom(user, BOT_TIMELIMIT, true)
    else if (config.model === 'lmm')
      await this.matchService.createWithLMM(
        user,
        config.depth,
        BOT_TIMELIMIT,
        true,
      )
  }

  @SubscribeMessage('bot-2')
  async handleBot2(@CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      this.socketsService.emit(user.uid, 'queueRejected')
      return
    }

    const configSnapshot = await this.botConfig
    const configs = configSnapshot.data()
    if (!configs) return
    const config = configs.bot2

    if (config.model === 'random')
      await this.matchService.createWithRandom(user, BOT_TIMELIMIT, true)
    else if (config.model === 'lmm')
      await this.matchService.createWithLMM(
        user,
        config.depth,
        BOT_TIMELIMIT,
        true,
      )
  }

  @SubscribeMessage('bot-3')
  async handleBot3(@CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      this.socketsService.emit(user.uid, 'queueRejected')
      return
    }

    const configSnapshot = await this.botConfig
    const configs = configSnapshot.data()
    if (!configs) return
    const config = configs.bot3

    if (config.model === 'random')
      await this.matchService.createWithRandom(user, BOT_TIMELIMIT, true)
    else if (config.model === 'lmm')
      await this.matchService.createWithLMM(
        user,
        config.depth,
        BOT_TIMELIMIT,
        true,
      )
  }

  @SubscribeMessage('casual')
  handleCasual(@CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      this.socketsService.emit(user.uid, 'queueRejected')
      return
    }

    this.queueService.enqueue(
      {
        user: {
          name: user.name,
          uid: user.uid,
          glicko: user.glicko,
        },
      },
      'casual',
    )

    const userQueueModes = this.queueService.getQueueModes(user.uid)
    this.socketsService.emit(user.uid, 'queueModes', userQueueModes)

    console.log(`Player "${user.name}" enqueued on casual mode.`)
    this.socketsService.emit(user.uid, 'queueAcepted', { mode: 'casual' })
  }

  @SubscribeMessage('ranked')
  handleRanked(@CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      this.socketsService.emit(user.uid, 'queueRejected')
      return
    }

    this.queueService.enqueue(
      {
        user: {
          name: user.name,
          uid: user.uid,
          glicko: user.glicko,
        },
      },
      'ranked',
    )

    const userQueueModes = this.queueService.getQueueModes(user.uid)
    this.socketsService.emit(user.uid, 'queueModes', userQueueModes)

    console.log(`User "${user.name}" enqueued on ranked mode.`)
    this.socketsService.emit(user.uid, 'queueAcepted', { mode: 'ranked' })
  }

  @SubscribeMessage('dequeue')
  handleDequeue(
    @CurrentUser() user: GamePlayerProfile,
    @MessageBody() message: 'ranked' | 'casual',
  ) {
    this.queueService.dequeue(user.uid, message)

    const userQueueModes = this.queueService.getQueueModes(user.uid)
    this.socketsService.emit(user.uid, 'queueModes', userQueueModes)

    console.log(`User "${user.name}" dequeued from mode "${message}".`)
  }

  isAvailable(uid: string) {
    return (
      this.queueService.isAvailable(uid) && this.matchService.isAvailable(uid)
    )
  }

  handleDisconnect(client: QueueSocket) {
    const user = client.data.user
    if (user) {
      this.queueService.dequeue(user.uid)
      this.socketsService.remove(user.uid, client)
    }
  }
}
