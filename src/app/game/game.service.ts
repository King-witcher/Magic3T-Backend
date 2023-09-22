import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Game, GameReport } from '../../lib/Game'
import { Choice } from 'src/lib/Player'
import { GameGateway } from './game.gateway'

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
  constructor(private gameGateway: GameGateway) {}

  createGame() {
    return this.gameGateway.createGame()
  }
}
