import { Logger, ParseIntPipe, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { MatchService } from './match.service'
import { PlayerSocket } from './models/PlayerSocket'
import { CurrentPlayer } from './decorators/currentPlayer.decorator'
import { PlayerHandler } from './models/Player'
import { CurrentMatch } from './decorators/currentMatch.decorator'
import { Match } from './models/Match'
import { Choice } from '@/lib/Player'

//@UseGuards(MatchGuard)
@WebSocketGateway({ cors: '*', namespace: 'match' })
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private matchService: MatchService) {}

  handleConnection(@ConnectedSocket() socket: PlayerSocket) {
    const { matchId } = socket.handshake.query
    const { playerKey } = socket.handshake.auth

    if (typeof matchId === 'string' && typeof playerKey === 'string') {
      const match = this.matchService.getMatch(matchId)
      if (match) {
        const player = match.getPlayer(playerKey)
        if (player && player.socket === null) {
          socket.data.player = player
          socket.data.match = match
          player.socket = socket
          Logger.log('Player connected', 'MatchGateway')
          return
        }
      }
    }
    Logger.error('Player rejected', 'MatchGateway')
    socket.disconnect()
  }

  @SubscribeMessage('ready')
  handleReady(
    @CurrentPlayer() player: PlayerHandler,
    @CurrentMatch() match: Match
  ) {
    Logger.log('Player ready', 'GameGateway')
    player.onReady()
    player.emitState()
    player.oponent.emitState()
  }

  @SubscribeMessage('choice')
  handleChoice(
    @CurrentPlayer() player: PlayerHandler,
    @MessageBody(ParseIntPipe) choice: Choice
  ) {
    player.handleChoice(choice)
    player.emitState()
    player.oponent.emitState()
  }

  handleDisconnect(client: Socket) {
    Logger.log('Player disconnected.', 'MatchGateway')
    // Should set a timer to forfeit if the player doesn't reconnect.
  }
}
