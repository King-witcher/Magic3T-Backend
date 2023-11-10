import {
  ConnectedSocket,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { MatchService } from '../match/match.service'
import { Logger, UseGuards } from '@nestjs/common'
import { CurrentUser } from './decorators/currentUser.decorator'
import { GamePlayerProfile } from './types/GamePlayerProfile'
import { QueueGuard } from './queue.guard'
import { Queue } from './lib/Queue'
import { SimpleQueue } from './lib/SimpleQueue'
import { QueueServer, QueueSocket } from './types/QueueSocket'

@UseGuards(QueueGuard)
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: QueueServer
  casualQueue: Queue
  rankedQueue: Queue

  constructor(private matchService: MatchService) {
    this.casualQueue = new SimpleQueue((entry1, entry2) => {
      const match = this.matchService.createMatch({
        white: entry1.user,
        black: entry2.user,
        config: {
          isRanked: false,
          readyTimeout: 2000,
          timelimit: 1000 * 105,
        },
      })
      entry1.socket.emit('matchFound', {
        matchId: match.id,
      })
      entry2.socket.emit('matchFound', {
        matchId: match.id,
      })
      // entry1.socket.disconnect()
      // entry2.socket.disconnect()
    })

    this.rankedQueue = new SimpleQueue((player1, player2) => {
      const match = this.matchService.createMatch({
        white: player1.user,
        black: player2.user,
        config: {
          isRanked: true,
          readyTimeout: 2000,
          timelimit: 1000 * 90,
        },
      })

      player1.socket.emit('matchFound', {
        matchId: match.id,
      })
      player2.socket.emit('matchFound', {
        matchId: match.id,
      })
      // player1.socket.disconnect()
      // player2.socket.disconnect()
    })

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
    }, 2000)
  }

  @SubscribeMessage('casual')
  handleCasual(@ConnectedSocket() client: QueueSocket, @CurrentUser() user: GamePlayerProfile) {
    this.rankedQueue.dequeue(user.uid)
    if (!this.isAvailable(user.uid)) {
      Logger.error('Player unavailable', 'QueueGateway')
      client.emit('queueFailed')
      return
    }

    Logger.log('Player enqueued on casual gameMode', 'QueueGateway')
    this.casualQueue.enqueue({
      socket: client,
      user: {
        name: user.name,
        uid: user.uid,
        glicko: user.glicko,
      },
    })
  }

  @SubscribeMessage('ranked')
  handleRanked(@ConnectedSocket() client: QueueSocket, @CurrentUser() user: GamePlayerProfile) {
    this.casualQueue.dequeue(user.uid)
    if (!this.isAvailable(user.uid)) {
      Logger.error('Player unavailable', 'QueueGateway')
      client.emit('queueFailed')
      return
    }

    Logger.log('Player enqueued on ranked gameMode', 'QueueGateway')

    this.rankedQueue.enqueue({
      socket: client,
      user: {
        name: user.name,
        uid: user.uid,
        glicko: user.glicko,
      },
    })
  }

  isAvailable(uid: string) {
    return this.casualQueue.isAvailable(uid) && this.rankedQueue.isAvailable(uid) && this.matchService.isAvailable(uid)
  }

  handleDisconnect(client: QueueSocket) {
    const user = client.data.user
    if (user) {
      this.rankedQueue.dequeue(user.uid)
      this.casualQueue.dequeue(user.uid)
    }
  }
}
