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
import Timer from '@/lib/Timer'
import { RandomBot } from '@/lib/bots/RandomBot'

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

  @SubscribeMessage('bot-1')
  async handleBot1(@CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      this.socketsService.emit(user.uid, 'queueRejected')
      return
    }

    const botProfile = {
      glicko: {
        deviation: 0,
        rating: 300,
        timestamp: new Date(),
      },
      name: 'Random Bot',
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

    match[botSide].state.timer.setRemaining(10)

    this.socketsService.emit(user.uid, 'matchFound', {
      matchId: match.id,
      oponentId: 'randombot',
    })

    const bot = new RandomBot(match[botSide])
    match[botSide].channel = bot.getChannel()
    match.emitState()
    match[botSide].onReady()
  }

  @SubscribeMessage('bot-2')
  async handleBot2(@CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      this.socketsService.emit(user.uid, 'queueRejected')
      return
    }

    const botProfile = {
      glicko: {
        deviation: 0,
        rating: 1800,
        timestamp: new Date(),
      },
      name: 'Bot LMM 5',
      uid: 'botlmm5',
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

    match[botSide].state.timer.setRemaining(100)

    this.socketsService.emit(user.uid, 'matchFound', {
      matchId: match.id,
      oponentId: 'botlmm5',
    })

    const bot = new LMMBot(match[botSide], 5)
    match[botSide].channel = bot.getChannel()
    match.emitState()
    match[botSide].onReady()
  }

  @SubscribeMessage('bot-3')
  async handleBot3(@CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      this.socketsService.emit(user.uid, 'queueRejected')
      return
    }

    const botProfile = {
      glicko: {
        deviation: 0,
        rating: Infinity,
        timestamp: new Date(),
      },
      name: 'Bot LMM 9',
      uid: 'botlmm9',
      isAnonymous: false,
    }

    const botSide = Math.random() < 0.5 ? 'white' : 'black'

    const match = this.matchService.createMatch({
      white: botSide === 'black' ? user : botProfile,
      black: botSide === 'black' ? botProfile : user,
      config: {
        isRanked: false,
        readyTimeout: 2000,
        timelimit: 1000 * 60 * 60,
      },
    })

    match[botSide].state.timer.setRemaining(3000)

    this.socketsService.emit(user.uid, 'matchFound', {
      matchId: match.id,
      oponentId: 'botlmm9',
    })

    const bot = new LMMBot(match[botSide], 9)
    match[botSide].channel = bot.getChannel()
    match.emitState()
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
