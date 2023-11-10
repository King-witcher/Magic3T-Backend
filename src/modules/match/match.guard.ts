import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { PlayerSocket } from './types/PlayerSocket'
import { MatchService } from './match.service'
import { firebaseAuth } from '@/firebase/services'

@Injectable()
export class MatchGuard implements CanActivate {
  constructor(private matchService: MatchService) {}

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
      const authData = await firebaseAuth.verifyIdToken(token)

      const player = match.playerMap[authData.uid]
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
