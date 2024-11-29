import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'

import { SocketsService } from '@/common'
import { FirebaseService } from '@/firebase'
import { MatchService } from './services'
import { MatchSocket, MatchSocketEmitMap } from './types'

@Injectable()
export class MatchGuard implements CanActivate {
  private readonly logger = new Logger(MatchGuard.name, { timestamp: true })

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
      const { uid } = await this.firebaseService.firebaseAuth.verifyIdToken(
        token,
      )

      const matchAdapter = this.matchService.getAdapter(uid)
      if (!matchAdapter) {
        throw new Error(`user ${uid} is not currently in a match`)
      }

      this.logger.log(`connection from user ${uid} accepted`)
      socket.data.matchAdapter = matchAdapter
      socket.data.uid = uid
      this.matchSocketsService.add(uid, socket)
      return true
    } catch (e) {
      this.logger.error(`connection rejected: ${e.message}`)
      return false
    }
  }
}
