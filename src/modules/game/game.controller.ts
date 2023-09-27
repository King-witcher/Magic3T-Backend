import { Controller, Get, Inject } from '@nestjs/common'
import { IsPublic } from '../auth/decorators/is-public.decorator'

@Controller('game')
export class GameController {
  constructor(@Inject('GAME_MODES') private readonly gameModes) {}

  @IsPublic()
  @Get('modes')
  getGameModes() {
    return this.gameModes
  }
}
