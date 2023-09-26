import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { MatchService } from './match.service'

@Injectable()
export class MatchGuard implements CanActivate {
  constructor(private matchService: MatchService) {}

  canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient<Socket>()

    const matchId = client.handshake.query.matchId
    const playerKey = client.handshake.auth.playerId

    console.log('guard used', matchId, playerKey)

    if (typeof matchId === 'string' && typeof playerKey === 'string') {
      const match = this.matchService.getMatch(matchId)
      if (match) {
        const player = match.getPlayer(playerKey)
        if (player && player.socket === client) {
          client.data.player = player
          client.data.match = match
          return true
        }
      }
    }
    return false
  }
}
