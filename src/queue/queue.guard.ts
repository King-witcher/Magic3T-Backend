import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'

import { SocketsService } from '@/common'
import { QueueEmitType, QueueSocket } from './types'
import { FirebaseService } from '@/firebase'

@Injectable()
export class QueueGuard implements CanActivate {
  private readonly logger = new Logger(QueueGuard.name, { timestamp: true })

  constructor(
    @Inject('QueueSocketsService')
    private queueSocketsService: SocketsService<QueueEmitType>,
    private firebaseService: FirebaseService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const socket = context.switchToWs().getClient<QueueSocket>()
    const token = socket.handshake.auth.token

    // Socket has already been validated.
    if (socket.data.uid) return true

    try {
      const { uid } = await this.firebaseService.firebaseAuth.verifyIdToken(
        token,
      )

      socket.data.uid = uid

      this.queueSocketsService.add(uid, socket)
      this.logger.log(`connection from user ${uid} accepted`)
      return true
    } catch (e) {
      this.logger.error(`connection rejected: ${e.message}`)
      return false
    }
  }
}
