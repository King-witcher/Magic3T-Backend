import { Inject, Injectable, Logger, ParseIntPipe } from '@nestjs/common'
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
import { Game } from 'src/lib/Game'
import { Choice, Player } from 'src/lib/Player'
import { PlayerHandler } from './player.handler'
import { CasualGameConfig } from '../config/config.symbols'
import { GameConfig } from '../config/config.types'
import {
  ChoiceUnavailableException,
  GameFinishedException,
  WrongTurnException,
} from './game.exceptions'
import { PlayerResult } from './game.types'

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
  tokens: Record<string, PlayerHandler> = {}

  /**SocketId -> Player */
  players: Record<string, PlayerHandler> = {}

  constructor(@Inject(CasualGameConfig) private casualGameConfig: GameConfig) {}

  handleConnection(socket: Socket): void {
    const token = socket.handshake.auth.token
    if (!token) {
      socket.disconnect()
      return
    }

    const player = this.tokens[token]

    if (!player) {
      socket.disconnect()
      return
    }

    delete this.tokens[token]
    this.players[socket.id] = player
    player.socket = socket
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
      throw new ChoiceUnavailableException() // hackeável
    if (player.result) throw new GameFinishedException()

    player.choices.push(choice as Choice)

    const triple = player.isWinner() // optimizável

    // O jogador venceu a partida
    if (triple) {
      player.timer.pause()
      player.turn = false
      player.result = PlayerResult.Victory
      player.oponent.result = PlayerResult.Defeat

      socket.emit('victory', {})
      player.oponent.socket?.emit('defeat', {})
    } else {
      if (player.choices.length + player.oponent.choices.length === 9) {
        player.timer.pause()
        player.turn = false
        player.result = player.oponent.result = PlayerResult.Draw
        socket.emit('draw', {})
        player.oponent.socket?.emit('draw', {})
      } else {
        player.turn = false
        player.oponent.turn = true
        socket.emit('ack', {})
        player.oponent.socket?.emit('oponentChoice', choice)
        // Emitir o estado atual do jogo para os dois
      }
    }
  }

  handleDisconnect(client: any) {}
}
