import { Injectable } from '@nestjs/common'
import { Player } from './lib/Player'
import { Game, GameReport } from './lib/Game'

@Injectable()
export class GameService {
  games: { [playerId: string]: Game } = {}

  createGame([player1, player2]: [Player, Player]) {
    const game = new Game([player1, player2])
    this.games[player1.playerId] = this.games[player2.playerId] = game
    game.start()
  }

  getGameState(playerId: string): GameReport | null {
    const game = this.games[playerId]
    if (!game) return null

    return game.getStateReport(playerId)
  }
}
