import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common'
import { Auth } from 'firebase-admin/auth'
import { QueueSocket } from './models/QueueSocket'
import { FirebaseAuth } from '@/modules/firebase/firebase.module'
import { Firestore } from 'firebase-admin/firestore'
import { models } from '@/firebase/models'

@Injectable()
export class QueueGuard implements CanActivate {
  constructor(@Inject(FirebaseAuth) private auth: Auth, @Inject(Firestore) private firestore: Firestore) {}

  async canActivate(context: ExecutionContext) {
    const socket = context.switchToWs().getClient<QueueSocket>()
    const token = socket.handshake.auth.token

    if (socket.data.user) return true
    try {
      const authData = await this.auth.verifyIdToken(token)
      const userData = await models.users.getById(authData.uid)

      socket.data.user = {
        name: userData.nickname,
        uid: userData._id,
        glicko: userData.glicko,
      }

      return true
    } catch (e) {
      Logger.error(e.message, 'QueueGuard')
      return false
    }
  }
}
