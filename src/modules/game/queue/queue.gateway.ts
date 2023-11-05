import {
  ConnectedSocket,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { MatchService } from '../match/match.service'
import { Inject, Logger, UseGuards } from '@nestjs/common'
import { QueueEntry } from './models/QueueEntry'
import { CurrentUser } from './decorators/currentUser.decorator'
import { PlayerProfile } from './models/PlayerProfile'
import { QueueGuard } from './queue.guard'
import { Firestore } from 'firebase-admin/firestore'
import { Queue } from './models/Queue'
import { SimpleQueue } from './models/SimpleQueue'
import { QueueSocket } from './models/QueueSocket'

@UseGuards(QueueGuard)
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server
  casualQueue: Queue
  rankedQueue: Queue

  constructor(private matchService: MatchService, @Inject(Firestore) private firestore: Firestore) {
    this.casualQueue = new SimpleQueue((player1, player2) => {
      const match = this.matchService.createMatch({
        white: player1.user,
        black: player2.user,
        config: {
          ranked: false,
          readyTimeout: 2000,
          timelimit: 1000 * 105,
        },
      })
      player1.socket.emit('matchFound', {
        matchId: match.id,
      })
      player2.socket.emit('matchFound', {
        matchId: match.id,
      })
      player1.socket.disconnect()
      player2.socket.disconnect()
    })

    this.rankedQueue = new SimpleQueue((player1, player2) => {
      const match = this.matchService.createMatch({
        white: player1.user,
        black: player2.user,
        config: {
          ranked: true,
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
      player1.socket.disconnect()
      player2.socket.disconnect()
    })
  }

  @SubscribeMessage('casual')
  handleCasual(@ConnectedSocket() client: Socket, @CurrentUser() user: PlayerProfile) {
    if (this.rankedQueue.contains(user.uid)) return

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
  handleRanked(@ConnectedSocket() client: Socket, @CurrentUser() user: PlayerProfile) {
    if (this.casualQueue.contains(user.uid)) return
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

  handleDisconnect(client: QueueSocket) {
    const user = client.data.user
    if (user) {
      this.rankedQueue.dequeue(user.uid)
      this.casualQueue.dequeue(user.uid)
    }
  }
}
