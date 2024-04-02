import { Logger, UseGuards } from '@nestjs/common'
import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { PlayerEmitType, PlayerSocket } from './types/PlayerSocket'
import { CurrentPlayer } from './decorators/currentPlayer.decorator'
import { Player } from './lib/Player'
import { CurrentMatch } from './decorators/currentMatch.decorator'
import { Match } from './lib/Match'
import { ChoicePipe } from './choice.pipe'
import { Choice } from '@/types/Choice'
import { MatchGuard } from './match.guard'
import { SocketsService } from '../sockets.service'

@UseGuards(MatchGuard)
@WebSocketGateway({ cors: '*', namespace: 'match' })
export class MatchGateway implements OnGatewayDisconnect {
  constructor(private socketsService: SocketsService<PlayerEmitType>) {}

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
    player.channel.sendOponentUid(player.oponent.profile.uid)
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
    player.channel.sendOponentUid(player.oponent.profile.uid)
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
    const player = client.data.player
    if (player) {
      console.log(`Player ${player.profile.name} has lost connection.`)
      this.socketsService.remove(player.profile.uid, client)
    }
  }
}
