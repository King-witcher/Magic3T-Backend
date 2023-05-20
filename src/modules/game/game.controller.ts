import { Controller, Get, Param } from '@nestjs/common'
import { GameService } from './game.service'

@Controller('game')
export class GameController {
  constructor(public gameService: GameService) {}

  @Get(':playerId/game-state')
  getGameState(@Param('playerId') playerId: string) {
    return this.gameService.getGameState(playerId)
  }

  @Get(':playerId/game-events')
  getGameEvents() {}

  @Get(':playerId/pending-events')
  getPendingEvents() {}
}
