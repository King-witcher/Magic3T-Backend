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
  constructor(
    @Inject('QueueSocketsService')
    private queueSocketsService: SocketsService<QueueEmitType>,
    private firebaseService: FirebaseService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const socket = context.switchToWs().getClient<QueueSocket>()
    const token = socket.handshake.auth.token

    try {
      const { uid } = await this.firebaseService.firebaseAuth.verifyIdToken(
        token,
      )

      socket.data.uid = uid

      this.queueSocketsService.add(uid, socket)

      return true
    } catch (e) {
      console.error(e)
      Logger.error('Error caught on QueueGuard')
      return false
    }
  }
}
