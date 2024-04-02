import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common'
import { QueueSocket } from './types/QueueSocket'
import { firebaseAuth } from '@/firebase/services'
import { SocketsService } from '../sockets.service'
import { UsersService } from '@modules/database/users/users.service'
import { FirebaseModule } from '@modules/firebase/firebase.module'
import { FirebaseService } from '@modules/firebase/firebase.service'

@Injectable()
export class QueueGuard implements CanActivate {
  constructor(
    private socketsService: SocketsService<QueueSocket>,
    private usersService: UsersService,
    private firebaseService: FirebaseService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const socket = context.switchToWs().getClient<QueueSocket>()
    const token = socket.handshake.auth.token

    try {
      const authData = await this.firebaseService.firebaseAuth.verifyIdToken(
        token,
      )
      const userData = await this.usersService.get(authData.uid)

      if (!userData) {
        Logger.error(`User with id ${authData.uid} not found`)
        return false
      }

      socket.data.user = {
        name: userData.nickname,
        uid: userData._id,
        glicko: userData.glicko,
      }

      this.socketsService.add(userData._id, socket)

      return true
    } catch (e) {
      console.error(e)
      Logger.error('Error caught on QueueGuard')
      return false
    }
  }
}
