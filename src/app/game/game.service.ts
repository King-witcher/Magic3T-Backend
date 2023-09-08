import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Game, GameReport } from '../../lib/Game'
import { Choice } from 'src/lib/Player'

const timelimit = 80 * 1000

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

    return game
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
