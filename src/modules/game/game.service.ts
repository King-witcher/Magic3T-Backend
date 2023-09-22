import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { Game, GameReport } from '../../lib/Game'
import { Choice } from 'src/lib/Player'
import { GameGateway } from './game.gateway'
import { PlayerHandler } from './PlayerHandler'
import { v4 } from 'uuid'
import { GameConfig } from '../config/config.types'
import { CasualGameConfig } from '../config/config.symbols'

const timelimit = parseInt(process.env.GAME_TIMELIMIT || '180000')

type PlayerProps = {
  nickname: string | null
  rating: number | null
}
interface CreateGameProps {
  player1: PlayerProps
  player2: PlayerProps
}

@Injectable()
export class GameService {
  games: { [playerId: string]: Game } = {}
  constructor(
    private gameGateway: GameGateway,
    @Inject(CasualGameConfig) private casualGameConfig: GameConfig
  ) {}

  /**Tokens de jogadores que ainda não se conectaram com o servidor. */
  private waitingConnection: Record<string, PlayerHandler> = {}

  /**SocketId -> Player */
  private players: Record<string, PlayerHandler> = {}

  createGame() {
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

  readyPlayer(token: string) {
    const player = this.waitingConnection[token]
    if (player) {
      delete this.waitingConnection[token]
      //this.players[token]
      player.onReady()
    }
  }

  getActivePlayer(socketId: string) {
    return this.players[socketId]
  }
}
