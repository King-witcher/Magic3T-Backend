import { Inject, Logger, ParseIntPipe } from '@nestjs/common'
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Choice } from 'src/lib/Player'
import { PlayerHandler } from './PlayerHandler'
import { CasualGameConfig } from '../config/config.symbols'
import { GameConfig } from '../config/config.types'
import {
  ChoiceUnavailableException,
  GameFinishedException,
  WrongTurnException,
} from './game.exceptions'
import { PlayerResult } from './game.types'
import { v4 } from 'uuid'

const timelimit = 80 * 1000

interface CreateGameProps {
  player1: PlayerProps
  player2: PlayerProps
}

type PlayerProps = {
  nickname: string | null
  rating: number | null
}

type Connection = {
  playerId: string
}

@WebSocketGateway({ cors: '*', namespace: 'game' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  /**Tokens de jogadores que ainda não se conectaram com o servidor. */
  waitingConnection: Record<string, PlayerHandler> = {}

  /**SocketId -> Player */
  players: Record<string, PlayerHandler> = {}

  constructor(@Inject(CasualGameConfig) private casualGameConfig: GameConfig) {}

  createGame(): [string, string] {
    const player1 = new PlayerHandler({
      timeLimit: this.casualGameConfig.timeLimit,
    })
    const player2 = new PlayerHandler({
      timeLimit: this.casualGameConfig.timeLimit,
    })
    player1.setOponent(player2)

    const id1 = v4()
    const id2 = v4()

    this.waitingConnection[id1] = player1
    this.waitingConnection[id2] = player2

    Logger.log(`Game created for ids ${id1} and ${id2}.`, 'GameGateway')
    return [id1, id2]
  }

  handleConnection(socket: Socket): void {
    const token = socket.handshake.auth.token
    if (!token) {
      socket.disconnect()
      Logger.error('Connection attempt failed: no token.', 'GameGateway')
      return
    }

    const player = this.waitingConnection[token]
    if (!player) {
      socket.disconnect()
      Logger.error('Connection attempt failed: bad token.', 'GameGateway')
      return
    }

    Logger.log(`Player with token ${token} connected.`, 'GameGateway')

    delete this.waitingConnection[token]
    this.players[socket.id] = player
    player.socket = socket
  }

  @SubscribeMessage('ready')
  handleReady(@ConnectedSocket() socket: Socket) {
    const player = this.players[socket.id]

    player.onReady()
    player.emitState()
    player.oponent.emitState()
  }

  @SubscribeMessage('choice')
  handleChoice(
    @ConnectedSocket() socket: Socket,
    @MessageBody(ParseIntPipe) choice: number
  ) {
    const player = this.players[socket.id]

    player.handleChoice(choice as Choice)

    player.emitState()
    player.oponent.emitState()
  }

  handleDisconnect(client: any) {
    Logger.log(`Player ${client.id} disconnected.`, 'GameGateway')
  }
}
