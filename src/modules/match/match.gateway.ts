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
import { ChoicePipe } from './choice.pipe'
import { Choice } from '@/types/Choice'
import { MatchGuard } from './match.guard'
import { SocketsService } from '../sockets.service'
import { IMatchAdapter } from '@modules/match/lib/adapters/matchAdapter'
import { Uid } from '@modules/queue/decorators/currentUser.decorator'
import { MatchService } from '@modules/match/match.service'

@UseGuards(MatchGuard)
@WebSocketGateway({ cors: '*', namespace: 'match' })
export class MatchGateway implements OnGatewayDisconnect {
  constructor(
    @Inject('MatchSocketsService')
    private socketsService: SocketsService<MatchSocketEmitMap>,
    private matchService: MatchService,
  ) {}

  @SubscribeMessage(MatchSocketListenedEvent.Forfeit)
  handleForfeit(@CurrentMatchAdapter() matchAdapter: IMatchAdapter) {
    matchAdapter.forfeit()
  }

  // TODO: Introduce this pattern
  @SubscribeMessage(MatchSocketListenedEvent.GetState)
  handleGetStatus(
    @CurrentMatchAdapter() matchAdapter: IMatchAdapter,
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
    @CurrentMatchAdapter() adapter: IMatchAdapter,
    @MessageBody(ChoicePipe) choice: Choice,
  ) {
    console.log('gets called')
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
