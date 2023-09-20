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
    socket.emit('gameState', JSON.stringify(player.getState()))
    player.oponent.socket?.emit(
      'gameState',
      JSON.stringify(player.oponent.getState())
    )
  }

  @SubscribeMessage('choice')
  handleChoice(
    @ConnectedSocket() socket: Socket,
    @MessageBody(ParseIntPipe) choice: number
  ) {
    const player = this.players[socket.id]

    if (!player.oponent) return
    if (!player.turn) throw new WrongTurnException()
    if (
      [...player.choices, ...player.oponent.choices].includes(choice as Choice)
    )
      throw new ChoiceUnavailableException() // brecha hackeável
    if (player.result) throw new GameFinishedException()

    player.choices.push(choice as Choice)

    const triple = player.isWinner() // optimizável

    if (triple) {
      // O jogador venceu a partida
      player.timer.pause()
      player.turn = false
      player.result = PlayerResult.Victory
      player.oponent.result = PlayerResult.Defeat
    } else {
      if (player.choices.length + player.oponent.choices.length === 9) {
        // Partida empatou
        player.timer.pause()
        player.turn = false
        player.result = player.oponent.result = PlayerResult.Draw
      } else {
        // Partida seguiu normalmente
        player.turn = false
        player.oponent.turn = true
        // Emitir o estado atual do jogo para os dois
      }
    }

    socket.emit('gameState', JSON.stringify(player.getState()))
    player.oponent.socket?.emit(
      'gameState',
      JSON.stringify(player.oponent.getState())
    )
  }

  handleDisconnect(client: any) {
    Logger.log(`Player ${client.id} disconnected.`, 'GameGateway')
  }
}
