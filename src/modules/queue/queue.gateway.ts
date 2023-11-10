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

@UseGuards(QueueGuard)
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: QueueServer

  constructor(private matchService: MatchService, private queueService: QueueService) {
    setInterval(() => {
      this.server.emit('udpateUserCount', {
        casual: {
          inGame: 0,
          queue: 0,
        },
        connected: 0,
        ranked: {
          inGame: 0,
          queue: 0,
        },
      })
    }, 5000)
  }

  @SubscribeMessage('casual')
  handleCasual(@ConnectedSocket() client: QueueSocket, @CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      client.emit('queueRejected')
      return
    }

    this.queueService.enqueue(
      {
        socket: client,
        user: {
          name: user.name,
          uid: user.uid,
          glicko: user.glicko,
        },
      },
      'casual',
    )

    const userQueueModes = this.queueService.getQueueModes(user.uid)
    client.emit('queueModes', userQueueModes)

    console.log(`Player "${user.name}" enqueued on casual mode.`)
    client.emit('queueAcepted', { mode: 'casual' })
  }

  @SubscribeMessage('ranked')
  handleRanked(@ConnectedSocket() client: QueueSocket, @CurrentUser() user: GamePlayerProfile) {
    if (!this.matchService.isAvailable(user.uid)) {
      console.error(`Player "${user.name}" unavailable for queue: ingame.`)
      client.emit('queueRejected')
      return
    }

    this.queueService.enqueue(
      {
        socket: client,
        user: {
          name: user.name,
          uid: user.uid,
          glicko: user.glicko,
        },
      },
      'ranked',
    )

    const userQueueModes = this.queueService.getQueueModes(user.uid)
    client.emit('queueModes', userQueueModes)

    console.log(`User "${user.name}" enqueued on ranked mode.`)
    client.emit('queueAcepted', { mode: 'ranked' })
  }

  @SubscribeMessage('dequeue')
  handleDequeue(
    @ConnectedSocket() client: QueueSocket,
    @CurrentUser() user: GamePlayerProfile,
    @MessageBody() message: 'ranked' | 'casual',
  ) {
    this.queueService.dequeue(user.uid, message)

    const userQueueModes = this.queueService.getQueueModes(user.uid)
    client.emit('queueModes', userQueueModes)

    console.log(`User "${user.name}" dequeued from mode "${message}".`)
  }

  isAvailable(uid: string) {
    return this.queueService.isAvailable(uid) && this.matchService.isAvailable(uid)
  }

  handleDisconnect(client: QueueSocket) {
    const user = client.data.user
    if (user) {
      this.queueService.dequeue(user.uid)
    }
  }
}
