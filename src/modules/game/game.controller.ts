import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { GameService } from './game.service'
import ChoiceDto from './dto/choice.dto'

@Controller('game')
export class GameController {
  constructor(public gameService: GameService) {}

  @Get(':playerId/game-state')
  getGameState(@Param('playerId') playerId: string) {
    return this.gameService.getGameState(playerId) || 'not found'
  }

  @Post(':playerId/choices')
  choose(@Body() choice: ChoiceDto) {}

  @Post(':playerId/forfeit')
  forfeit() {}
}
