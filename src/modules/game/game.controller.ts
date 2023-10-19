import { Controller, Get, Inject } from '@nestjs/common'

@Controller('game')
export class GameController {
  constructor(@Inject('GAME_MODES') private readonly gameModes) {}

  @Get('modes')
  getGameModes() {
    return this.gameModes
  }
}
