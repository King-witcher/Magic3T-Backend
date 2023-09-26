import { Logger, ParseIntPipe } from '@nestjs/common'
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
import { Choice } from '@/lib/Player'

@WebSocketGateway({ cors: '*', namespace: 'match' })
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private matchService: MatchService) {}

  handleConnection(@ConnectedSocket() socket: PlayerSocket) {
    const { matchId, playerKey } = socket.handshake.auth

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
    console.log(matchId, playerKey)
    Logger.error('Connection rejected', 'MatchGateway')
    //socket.disconnect()
  }

  @SubscribeMessage('ready')
  handleReady(
    @CurrentPlayer() player: PlayerHandler,
    @ConnectedSocket() socket: PlayerSocket
  ) {
    Logger.log('Player ready', 'GameGateway')
    console.log(socket.handshake.query)
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
