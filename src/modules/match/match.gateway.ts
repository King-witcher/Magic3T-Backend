import { Logger, UseGuards } from '@nestjs/common'
import { MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { PlayerSocket } from './types/PlayerSocket'
import { CurrentPlayer } from './decorators/currentPlayer.decorator'
import { Player } from './lib/Player'
import { CurrentMatch } from './decorators/currentMatch.decorator'
import { Match } from './lib/Match'
import { ChoicePipe } from './choice.pipe'
import { Choice } from '../../types/Choice'
import { MatchGuard } from './match.guard'
import { GamePlayerProfile } from '../queue/types/GamePlayerProfile'

@UseGuards(MatchGuard)
@WebSocketGateway({ cors: '*', namespace: 'match' })
export class MatchGateway implements OnGatewayDisconnect {
  @SubscribeMessage('message')
  handleMessage(@CurrentPlayer() player: Player, @MessageBody() message: string) {
    player.oponent.socket?.emit('message', message)
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
      const payload: Partial<GamePlayerProfile> = {
        ...player.oponent.profile,
        isAnonymous: undefined,
      }

      player.socket?.emit('oponentProfile', payload)
    }
  }

  @SubscribeMessage('choice')
  handleChoice(@CurrentPlayer() player: Player, @CurrentMatch() match: Match, @MessageBody(ChoicePipe) choice: Choice) {
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
