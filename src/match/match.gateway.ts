import { ChoicePipe, SocketsService } from '@/common'
import { Inject, Logger, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'

import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'
import { Choice } from '@/types/Choice'
import { CurrentPerspective } from './decorators'
import { MatchGuard } from './match.guard'
import { MatchService } from './services'
import {
  MatchSocket,
  MatchSocketEmitMap,
  MatchSocketEmittedEvent,
  MatchSocketListenedEvent,
  Perspective,
} from './types'

@UseGuards(AuthGuard, MatchGuard)
@WebSocketGateway({ cors: '*', namespace: 'match' })
export class MatchGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(MatchGateway.name, { timestamp: true })

  constructor(
    @Inject('MatchSocketsService')
    private socketsService: SocketsService<MatchSocketEmitMap>,
    private matchService: MatchService
  ) {}

  @SubscribeMessage(MatchSocketListenedEvent.Forfeit)
  handleForfeit(@CurrentPerspective() matchAdapter: Perspective) {
    matchAdapter.forfeit()
  }

  @SubscribeMessage(MatchSocketListenedEvent.GetState)
  handleGetStatus(
    @CurrentPerspective() perspective: Perspective,
    @ConnectedSocket() client: MatchSocket
  ) {
    client.emit(MatchSocketEmittedEvent.GameState, perspective.state)
  }

  // Refactor this
  @SubscribeMessage(MatchSocketListenedEvent.Message)
  handleMessage(@UserId() uid: string, @MessageBody() body: string) {
    const opponent = this.matchService.getOpponent(uid)
    this.socketsService.emit(opponent, MatchSocketEmittedEvent.Message, body)
  }

  @SubscribeMessage(MatchSocketListenedEvent.GetOpponent)
  getOpponent(
    @UserId() userId: string,
    @ConnectedSocket() client: MatchSocket
  ) {
    const opponentUid = this.matchService.getOpponent(userId)
    client.emit(MatchSocketEmittedEvent.OpponentUid, opponentUid)
  }

  @SubscribeMessage(MatchSocketListenedEvent.Choice)
  async handleChoice(
    @CurrentPerspective() adapter: Perspective,
    @MessageBody(ChoicePipe) choice: Choice
  ) {
    adapter.makeChoice(choice)
  }

  handleDisconnect(client: MatchSocket) {
    const userId = client.data.userId
    if (userId) {
      this.logger.log(`user ${userId} disconnected`)
      this.socketsService.remove(userId, client)
    }
  }
}
