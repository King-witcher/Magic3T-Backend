import { Logger, UseGuards } from '@nestjs/common'
import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { PlayerSocket } from './types/PlayerSocket'
import { CurrentPlayer } from './decorators/currentPlayer.decorator'
import { Player } from './lib/Player'
import { CurrentMatch } from './decorators/currentMatch.decorator'
import { Match } from './lib/Match'
import { ChoicePipe } from './choice.pipe'
import { Choice } from '../../types/Choice'
import { MatchGuard } from './match.guard'

@UseGuards(MatchGuard)
@WebSocketGateway({ cors: '*', namespace: 'match' })
export class MatchGateway implements OnGatewayDisconnect {
  @SubscribeMessage('message')
  handleMessage(
    @CurrentPlayer() player: Player,
    @MessageBody() message: string,
  ) {
    player.oponent.channel.sendMessage(message)
  }

  @SubscribeMessage('ready')
  handleReady(@CurrentPlayer() player: Player, @CurrentMatch() match: Match) {
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

  @SubscribeMessage('getOponentProfile')
  getOponentProfile(@CurrentPlayer() player: Player) {
    player.channel.sendOponent(player.oponent.profile)
  }

  @SubscribeMessage('choice')
  handleChoice(
    @CurrentPlayer() player: Player,
    @CurrentMatch() match: Match,
    @MessageBody(ChoicePipe) choice: Choice,
  ) {
    player.onChoose(choice)
    match.emitState()
  }

  handleDisconnect(client: PlayerSocket) {
    if (client.data.player && client.data.player.getStatus() !== null) {
      Logger.log('Player forfeits by disconnection', 'MatchGateway')
      client.data.player.forfeit()
    }
  }
}
