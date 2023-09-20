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

  getGameState(playerId: string): GameReport | null {
    const game = this.games[playerId]
    if (!game) return null

    return game.getStateReport(playerId)
  }

  setChoice(playerId: string, choice: Choice) {
    const game = this.games[playerId]
    if (!game) throw new NotFoundException()

    game.setChoice(playerId, choice)
  }

  forfeit(playerId: string) {
    const game = this.games[playerId]
    if (!game) return null

    game.forfeit(playerId)
  }

  pushMessage(playerId: string, message: string) {
    const game = this.games[playerId]
    if (!game) throw new BadRequestException('invalid playerId')

    game.pushMessage(playerId, message)
  }
}
