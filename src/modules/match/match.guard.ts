import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common'
import { MatchSocketEmitMap, MatchSocket } from './types/MatchSocket'
import { MatchService } from './match.service'
import { SocketsService } from '../sockets.service'
import { FirebaseService } from '@modules/firebase/firebase.service'

@Injectable()
export class MatchGuard implements CanActivate {
  constructor(
    private matchService: MatchService,
    @Inject('MatchSocketsService')
    private matchSocketsService: SocketsService<MatchSocketEmitMap>,
    private firebaseService: FirebaseService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const socket = context.switchToWs().getClient<MatchSocket>()
    if (socket.data.matchAdapter && socket.data.uid) return true

    try {
      const { token } = socket.handshake.auth
      const authData = await this.firebaseService.firebaseAuth.verifyIdToken(
        token,
      )

      const matchAdapter = this.matchService.getAdapter(authData.uid)
      if (!matchAdapter) {
        console.error(`Bad player uid: ${authData.uid}`)
        return false
      }

      socket.data.matchAdapter = matchAdapter
      socket.data.uid = authData.uid
      this.matchSocketsService.add(authData.uid, socket)
      return true
    } catch (e) {
      console.error(e.message)
      return false
    }
  }
}
