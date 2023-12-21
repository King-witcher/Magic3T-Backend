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
import { SocketsService } from './sockets.service'
import { LMMBot } from '@/lib/bots/LMMBot'

@UseGuards(QueueGuard)
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: QueueServer

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

  @SubscribeMessage('bot')
  async handleBot(@CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      this.socketsService.emit(user.uid, 'queueRejected')
      return
    }

    const botProfile = {
      glicko: {
        deviation: 0,
        rating: 1500,
        timestamp: new Date(),
      },
      name: 'Magic3t Bot',
      uid: 'randombot',
      isAnonymous: false,
    }

    const botSide = Math.random() < 0.5 ? 'white' : 'black'

    const match = this.matchService.createMatch({
      white: botSide === 'black' ? user : botProfile,
      black: botSide === 'black' ? botProfile : user,
      config: {
        isRanked: false,
        readyTimeout: 2000,
        timelimit: 1000 * 60 * 3 + 1000 * 30,
      },
    })

    this.socketsService.emit(user.uid, 'matchFound', {
      matchId: match.id,
    })
    match.emitState()

    const bot = new LMMBot(match[botSide], 9)
    match[botSide].channel = bot.getChannel()
    match[botSide].onReady()
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
