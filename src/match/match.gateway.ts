import { Inject, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import {
  MatchSocket,
  MatchSocketEmitMap,
  MatchSocketEmittedEvent,
  MatchSocketListenedEvent,
} from './types/MatchSocket'
import { CurrentMatchAdapter } from './decorators/current-match.decorator'
import { ChoicePipe } from '../common/pipes/choice.pipe'
import { Choice } from '@/types/Choice'
import { MatchGuard } from './match.guard'
import { SocketsService } from '../common/services/sockets.service'
import { Uid } from '@/queue/decorators/currentUser.decorator'
import { MatchService } from '@/match/services/match.service'
import { MatchSideAdapter } from './types/match-side-adapter'

@UseGuards(MatchGuard)
@WebSocketGateway({ cors: '*', namespace: 'match' })
export class MatchGateway implements OnGatewayDisconnect {
  constructor(
    @Inject('MatchSocketsService')
    private socketsService: SocketsService<MatchSocketEmitMap>,
    private matchService: MatchService,
  ) {}

  @SubscribeMessage(MatchSocketListenedEvent.Forfeit)
  handleForfeit(@CurrentMatchAdapter() matchAdapter: MatchSideAdapter) {
    matchAdapter.forfeit()
  }

  // TODO: Introduce this pattern
  @SubscribeMessage(MatchSocketListenedEvent.GetState)
  handleGetStatus(
    @CurrentMatchAdapter() matchAdapter: MatchSideAdapter,
    @ConnectedSocket() client: MatchSocket,
  ) {
    client.emit(MatchSocketEmittedEvent.GameState, matchAdapter.state)
  }

  @SubscribeMessage(MatchSocketListenedEvent.GetOpponent)
  getOpponent(@Uid() uid: string, @ConnectedSocket() client: MatchSocket) {
    const opponentUid = this.matchService.getOpponent(uid)
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
      console.log(`[MatchGateway] ${uid} disconnected.`)
      this.socketsService.remove(uid, client)
    }
  }
}
