import { Logger } from '@nestjs/common'
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { Game } from 'src/lib/Game'

const timelimit = 80 * 1000

interface CreateGameProps {
  player1: PlayerProps
  player2: PlayerProps
}

type PlayerProps = {
  nickname: string | null
  rating: number | null
}

@WebSocketGateway({ cors: '*', namespace: 'game' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  games: { [playerId: string]: Game } = {}

  createGame({ player1, player2 }: CreateGameProps) {
    const game = new Game({
      player1: {
        nickname: player1.nickname,
        rating: player1.rating,
      },
      player2: {
        nickname: player2.nickname,
        rating: player2.rating,
      },
      timelimit,
    })

    this.games[game.player1.token] = this.games[game.player2.token] = game

    game.start()
  }

  @SubscribeMessage('message')
  private handleMessage(
    @MessageBody() message: any,
    @ConnectedSocket() socket: Socket
  ) {
    console.log(message, socket.handshake.auth)
  }

  handleConnection(client: any, ...args: any[]) {
    Logger.log('Client connected', 'Game Gateway')
  }

  handleDisconnect(client: any) {
    console.log('disc')
  }
}
