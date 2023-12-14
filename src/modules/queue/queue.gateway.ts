import {
  ConnectedSocket,
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
import { RandomBot } from '@/lib/RandomBot'

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
  handleBot(@CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      this.socketsService.emit(user.uid, 'queueRejected')
      return
    }

    const match = this.matchService.createMatch({
      white: user,
      black: {
        glicko: {
          deviation: 0,
          rating: 1500,
          timestamp: new Date(),
        },
        name: 'Random Bot',
        uid: 'randombot',
        isAnonymous: false,
      },
      config: {
        isRanked: false,
        readyTimeout: 2000,
        timelimit: 1000 * 105,
      },
    })

    const bot = new RandomBot(match.black)
    match.black.channel = bot.getChannel()
    match.black.onReady()
    this.socketsService.emit(user.uid, 'matchFound', {
      matchId: match.id,
    })
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
  handleDequeue(@CurrentUser() user: GamePlayerProfile, @MessageBody() message: 'ranked' | 'casual') {
    this.queueService.dequeue(user.uid, message)

    const userQueueModes = this.queueService.getQueueModes(user.uid)
    this.socketsService.emit(user.uid, 'queueModes', userQueueModes)

    console.log(`User "${user.name}" dequeued from mode "${message}".`)
  }

  isAvailable(uid: string) {
    return this.queueService.isAvailable(uid) && this.matchService.isAvailable(uid)
  }

  handleDisconnect(client: QueueSocket) {
    const user = client.data.user
    if (user) {
      this.queueService.dequeue(user.uid)
      this.socketsService.remove(user.uid, client)
    }
  }
}
