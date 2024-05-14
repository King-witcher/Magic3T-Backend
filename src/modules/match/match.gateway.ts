import { Inject, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets'
import {
  MatchSocket,
  MatchSocketEmitMap,
  MatchSocketEmittedEvent,
  MatchSocketListenedEvent,
} from './types/MatchSocket'
import { CurrentMatchAdapter } from './decorators/current-match.decorator'
import { ChoicePipe } from './choice.pipe'
import { Choice } from '@/types/Choice'
import { MatchGuard } from './match.guard'
import { SocketsService } from '../sockets.service'
import { IMatchAdapter } from '@modules/match/lib/adapters/matchAdapter'
import { Uid } from '@modules/queue/decorators/currentUser.decorator'
import { MatchService } from '@modules/match/match.service'
import { GatewayResponse } from '@/types/gateway-response'

@UseGuards(MatchGuard)
@WebSocketGateway({ cors: '*', namespace: 'match' })
export class MatchGateway implements OnGatewayDisconnect {
  constructor(
    @Inject('MatchSocketsService')
    private socketsService: SocketsService<MatchSocketEmitMap>,
    private matchService: MatchService,
  ) {}

  @SubscribeMessage('message')
  handleMessage(@Uid() uid: string, @MessageBody() message: string) {
    // DN
  }

  @SubscribeMessage('ready')
  handleReady() {
    // DN
  }

  @SubscribeMessage('forfeit')
  handleForfeit(@CurrentMatchAdapter() matchAdapter: IMatchAdapter) {
    matchAdapter.forfeit()
  }

  // TODO: Introduce this pattern
  @SubscribeMessage('get-state')
  handleGetStatus(
    @CurrentMatchAdapter() matchAdapter: IMatchAdapter,
  ): WsResponse<string> {
    return { event: 'gameState', data: JSON.stringify(matchAdapter.state) }
  }

  @SubscribeMessage(MatchSocketListenedEvent.GetOpponent)
  getOpponent(@Uid() uid: string, @ConnectedSocket() client: MatchSocket) {
    const opponentUid = this.matchService.getOpponent(uid)
    client.emit(MatchSocketEmittedEvent.OpponentUid, opponentUid)
  }

  @SubscribeMessage('choice')
  handleChoice(
    @CurrentMatchAdapter() adapter: IMatchAdapter,
    @MessageBody(ChoicePipe) choice: Choice,
  ) {
    adapter.makeChoice(choice)
  }

  handleDisconnect(client: MatchSocket) {
    const uid = client.data.uid
    if (uid) {
      console.log(`Player ${uid} has lost connection.`)
      this.socketsService.remove(uid, client)
    }
  }
}
