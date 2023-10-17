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
import { FirebaseAuth } from '@/modules/firebase/firebase.module'
import { Auth } from 'firebase-admin/auth'
import { QueueSocket } from './models/QueueSocket'
import { QueueEntry } from './models/QueueEntry'
import { CurrentUser } from './decorators/currentUser.decorator'
import { PlayerData } from './models/PlayerData'
import { QueueGuard } from './queue.guard'
import { Firestore } from 'firebase-admin/firestore'

@UseGuards(QueueGuard)
@WebSocketGateway({ cors: '*', namespace: 'queue' })
export class QueueGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server
  pendingEntry: QueueEntry | null = null

  constructor(
    private matchService: MatchService,
    @Inject(FirebaseAuth) private auth: Auth,
    @Inject(Firestore) private firestore: Firestore,
    @Inject('GAME_MODE_CONFIG') private gameModeConfig: any
  ) {}

  @SubscribeMessage('enqueue')
  handleEnqueue(
    @ConnectedSocket() client: Socket,
    @CurrentUser() user: PlayerData
  ) {
    if (this.pendingEntry?.user.uid === user.uid) {
      Logger.error('Cannot queue same uid twice.', 'QueueGateway')
      return 'Cannot queue same uid twice.'
    }

    Logger.log(`Player enqueued`, 'QueueGateway')
    if (this.pendingEntry) {
      const firestore = this.firestore
      const match = this.matchService.createMatch({
        firstPlayer: user,
        secondPlayer: this.pendingEntry.user,
        config: {
          readyTimeout: 2000,
          timelimit: 1000 * 150,
        },
        async onFinish() {
          const whitePlayer = match.getPlayer(user.uid)
          const blackPlayer = whitePlayer.oponent

          await firestore.collection('matchLogs').add({
            whitePlayer: whitePlayer.profile,
            blackPlayer: blackPlayer.profile,
            timestamp: new Date(),
            whiteResult: whitePlayer.getStatus(),
          })
        },
      })

      this.pendingEntry.socket.emit('matchFound', {
        matchId: match.id,
      })

      client.emit('matchFound', {
        matchId: match.id,
      })

      this.pendingEntry.socket.disconnect()
      client.disconnect()

      this.pendingEntry = null
      return
    }
    this.pendingEntry = {
      socket: client,
      user: {
        name: user.name,
        uid: user.uid,
        rating: user.rating,
      },
    }
  }

  handleDisconnect(client: Socket) {
    if (this.pendingEntry?.socket === client) {
      this.pendingEntry = null
      Logger.log(`Player leaved queue`, 'QueueGateway')
    }
  }
}
