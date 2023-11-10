import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { QueueSocket } from './types/QueueSocket'
import { models } from '@/firebase/models'
import { firebaseAuth } from '@/firebase/services'

@Injectable()
export class QueueGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const socket = context.switchToWs().getClient<QueueSocket>()
    const token = socket.handshake.auth.token

    // if (socket.data.user) return true
    try {
      const authData = await firebaseAuth.verifyIdToken(token)
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
