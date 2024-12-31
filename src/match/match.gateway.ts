import { Choice, ChoicePipe, SocketsService } from '@/common'
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
import { CurrentPerspective } from './decorators'
import { Perspective } from './lib'
import { MatchGuard } from './match.guard'
import { MatchService } from './match.service'
import {
  ClientMatchEvents,
  MatchServerEventsMap,
  MatchSocket,
  MessageData,
  ServerMatchEvents,
} from './types'

@UseGuards(AuthGuard, MatchGuard)
@WebSocketGateway({ cors: '*', namespace: 'match' })
export class MatchGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(MatchGateway.name, { timestamp: true })

  constructor(
    @Inject('MatchSocketsService')
    private socketsService: SocketsService<MatchServerEventsMap>,
    private matchService: MatchService
  ) {}

  @SubscribeMessage(ClientMatchEvents.Surrender)
  handleForfeit(@CurrentPerspective() perspective: Perspective) {
    perspective.surrender()
  }

  @SubscribeMessage(ClientMatchEvents.GetState)
  handleGetStatus(
    @CurrentPerspective() perspective: Perspective,
    @ConnectedSocket() client: MatchSocket
  ) {
    client.emit(ServerMatchEvents.StateReport, perspective.getStateReport())
  }

  // Refactor this
  @SubscribeMessage(ClientMatchEvents.Message)
  handleMessage(@UserId() uid: string, @MessageBody() body: string) {
    const opponent = this.matchService.getOpponent(uid)
    const messageData: MessageData = {
      message: body,
      sender: uid,
      time: Date.now(),
    }

    this.socketsService.emit(opponent, ServerMatchEvents.Message, messageData)
    this.socketsService.emit(uid, ServerMatchEvents.Message, messageData)
  }

  @SubscribeMessage(ClientMatchEvents.GetAssignments)
  getOpponent(
    @CurrentPerspective() perspective: Perspective,
    @ConnectedSocket() socket: MatchSocket
  ) {
    const assignments = perspective.getAssignments()
    socket.emit(ServerMatchEvents.Assignments, assignments)
  }

  @SubscribeMessage(ClientMatchEvents.Pick)
  async handleChoice(
    @CurrentPerspective() adapter: Perspective,
    @MessageBody(ChoicePipe) choice: Choice
  ) {
    adapter.pick(choice)
  }

  handleDisconnect(client: MatchSocket) {
    const userId = client.data.userId
    if (userId) {
      this.logger.log(`user ${userId} disconnected`)
      this.socketsService.remove(userId, client)
    }
  }
}
