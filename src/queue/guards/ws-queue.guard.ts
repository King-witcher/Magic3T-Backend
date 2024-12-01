import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'

import { SocketsService } from '@/common'
import { QueueEmitType, QueueSocket } from '.././types'
import { FirebaseService } from '@/firebase'

@Injectable()
export class WsQueueGuard implements CanActivate {
  private readonly logger = new Logger(WsQueueGuard.name, { timestamp: true })

  constructor(
    @Inject('QueueSocketsService')
    private queueSocketsService: SocketsService<QueueEmitType>,
    private firebaseService: FirebaseService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const socket = context.switchToWs().getClient<QueueSocket>()
    const token = socket.handshake.auth.token

    if (!token) throw new Error('auth token is missing')

    // Socket has already been validated.
    if (socket.data.uid) return true

    try {
      const { uid } = await this.firebaseService.firebaseAuth.verifyIdToken(
        token,
      )

      this.logger.log(`connection from user ${uid} accepted`)
      socket.data.uid = uid
      this.queueSocketsService.add(uid, socket)
      return true
    } catch (e) {
      this.logger.error(`connection rejected: ${e.message}`)
      return false
    }
  }
}
