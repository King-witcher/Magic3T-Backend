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
import { Player } from './models/Player'
import { CurrentMatch } from './decorators/currentMatch.decorator'
import { Match } from './models/Match'
import { ChoicePipe } from './pipes/choice.pipe'
import { Choice } from './models/Choice'

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
    Logger.error('Connection rejected', 'MatchGateway')
    //socket.disconnect()
  }

  @SubscribeMessage('ready')
  handleReady(
    @CurrentPlayer() player: Player,
    @CurrentMatch() match: Match,
    @ConnectedSocket() socket: PlayerSocket
  ) {
    Logger.log('Player ready', 'GameGateway')
    player.onReady()
    match.emitState()
  }

  @SubscribeMessage('forfeit')
  handleForfeit(@CurrentPlayer() player: Player, @CurrentMatch() match: Match) {
    Logger.log('Player forfeits', 'GameGateway')
    player.forfeit()
    match.emitState()
  }

  @SubscribeMessage('choice')
  handleChoice(
    @CurrentPlayer() player: Player,
    @CurrentMatch() match: Match,
    @MessageBody(ChoicePipe) choice: Choice
  ) {
    player.onChoose(choice)
    match.emitState()
  }

  handleDisconnect(client: PlayerSocket) {
    if (client.data.player && !client.data.player.result) {
      Logger.log('Player forfeits by disconnection', 'MatchGateway')
      client.data.player.forfeit()
      client.data.player.socket?.emit('enemyForfeits', {})
    }
  }
}
