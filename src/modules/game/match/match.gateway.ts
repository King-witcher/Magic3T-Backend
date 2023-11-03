import { Logger, UseGuards } from '@nestjs/common'
import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { MatchService } from './match.service'
import { PlayerSocket } from './models/PlayerSocket'
import { CurrentPlayer } from './decorators/currentPlayer.decorator'
import { Player } from './models/Player'
import { CurrentMatch } from './decorators/currentMatch.decorator'
import { Match } from './models/Match'
import { ChoicePipe } from './choice.pipe'
import { Choice } from './models/Choice'
import { MatchGuard } from './match.guard'
import { PlayerProfile } from '../queue/models/PlayerProfile'

@UseGuards(MatchGuard)
@WebSocketGateway({ cors: '*', namespace: 'match' })
export class MatchGateway implements OnGatewayDisconnect {
  @SubscribeMessage('message')
  handleMessage(@CurrentPlayer() player: Player, @MessageBody() message: any) {
    player.oponent.socket?.emit('message', message.toString())
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
    if (player.oponent.profile.isAnonymous) {
      player.socket?.emit('oponentProfile', null)
    } else {
      const payload: Partial<PlayerProfile> = {
        ...player.oponent.profile,
        isAnonymous: undefined,
      }

      player.socket?.emit('oponentProfile', payload)
    }
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
      client.data.player.socket?.emit('enemyForfeits', {})
    }
  }
}
