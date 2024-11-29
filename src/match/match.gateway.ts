import { Inject, Logger, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { ChoicePipe, SocketsService } from '@/common'

import { UserId } from '@/queue/decorators'
import { Choice } from '@/types/Choice'
import { MatchGuard } from './match.guard'
import {
  MatchSideAdapter,
  MatchSocket,
  MatchSocketEmitMap,
  MatchSocketEmittedEvent,
  MatchSocketListenedEvent,
} from './types'
import { MatchService } from './services'
import { CurrentMatchAdapter } from './decorators'

@UseGuards(MatchGuard)
@WebSocketGateway({ cors: '*', namespace: 'match' })
export class MatchGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(MatchGateway.name, { timestamp: true })

  constructor(
    @Inject('MatchSocketsService')
    private socketsService: SocketsService<MatchSocketEmitMap>,
    private matchService: MatchService,
  ) {}

  @SubscribeMessage(MatchSocketListenedEvent.Forfeit)
  handleForfeit(@CurrentMatchAdapter() matchAdapter: MatchSideAdapter) {
    matchAdapter.forfeit()
  }

  @SubscribeMessage(MatchSocketListenedEvent.GetState)
  handleGetStatus(
    @CurrentMatchAdapter() matchAdapter: MatchSideAdapter,
    @ConnectedSocket() client: MatchSocket,
  ) {
    client.emit(MatchSocketEmittedEvent.GameState, matchAdapter.state)
  }

  // Refactor this
  @SubscribeMessage(MatchSocketListenedEvent.Message)
  handleMessage(
    @ConnectedSocket() client: MatchSocket,
    @UserId() uid: string,
    @MessageBody() body: string,
  ) {
    const opponent = this.matchService.getOpponent(uid)
    this.socketsService.emit(opponent, MatchSocketEmittedEvent.Message, body)
  }

  @SubscribeMessage(MatchSocketListenedEvent.GetOpponent)
  getOpponent(
    @UserId() userId: string,
    @ConnectedSocket() client: MatchSocket,
  ) {
    const opponentUid = this.matchService.getOpponent(userId)
    client.emit(MatchSocketEmittedEvent.OpponentUid, opponentUid)
  }

  @SubscribeMessage(MatchSocketListenedEvent.Choice)
  async handleChoice(
    @CurrentMatchAdapter() adapter: MatchSideAdapter,
    @MessageBody(ChoicePipe) choice: Choice,
  ) {
    adapter.makeChoice(choice)
  }

  handleDisconnect(client: MatchSocket) {
    const uid = client.data.uid
    if (uid) {
      this.logger.log(`user ${uid} disconnected`)
      this.socketsService.remove(uid, client)
    }
  }
}
