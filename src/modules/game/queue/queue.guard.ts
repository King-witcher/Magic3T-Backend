import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Auth } from 'firebase-admin/auth'
import { QueueSocket } from './models/QueueSocket'
import { FirebaseAuth } from '@/modules/firebase/firebase.module'

@Injectable()
export class QueueGuard implements CanActivate {
  constructor(@Inject(FirebaseAuth) private auth: Auth) {}

  async canActivate(context: ExecutionContext) {
    const socket = context.switchToWs().getClient<QueueSocket>()
    const token = socket.handshake.auth.token

    if (socket.data.user) return true
    try {
      const authData = await this.auth.verifyIdToken(token)
      socket.data.user = {
        name: authData.name,
        uid: authData.uid,
        rating: 0,
      }
      return true
    } catch (e) {
      Logger.error(e.message, 'QueueGuard')
      return false
    }
  }
}
