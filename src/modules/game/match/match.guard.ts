import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Auth } from 'firebase-admin/auth'
import { PlayerSocket } from './models/PlayerSocket'
import { FirebaseAuth } from '@/modules/firebase/firebase.module'
import { MatchService } from './match.service'

@Injectable()
export class MatchGuard implements CanActivate {
  constructor(
    @Inject(FirebaseAuth) private auth: Auth,
    private matchService: MatchService
  ) {}

  async canActivate(context: ExecutionContext) {
    const socket = context.switchToWs().getClient<PlayerSocket>()
    const { token, matchId } = socket.handshake.auth

    if (socket.data.player && socket.data.match) return true

    const match = this.matchService.getMatch(matchId)
    if (!match) {
      Logger.error('Invalid matchId', 'MatchGuard')
      return false
    }

    try {
      const authData = await this.auth.verifyIdToken(token)

      const player = match.players[authData.uid]
      if (!player) {
        Logger.error('Invalid player uid.', 'MatchGuard')
        return false
      }

      socket.data.match = match
      socket.data.player = player
      player.socket = socket
      Logger.log('Connection accepted', 'MatchGuard')
      return true
    } catch (e) {
      Logger.error(e.message, 'MatchGuard')
      return false
    }
  }
}
