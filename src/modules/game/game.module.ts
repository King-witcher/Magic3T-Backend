import { DynamicModule, Module } from '@nestjs/common'
import { QueueModule } from './queue/queue.module'
import { GameController } from './game.controller'

@Module({})
export class GameModule {
  private static gameModes: GameModeConfig[] = []

  static forRoot(): DynamicModule {
    return {
      module: GameModule,
      controllers: [GameController],
      providers: [
        {
          provide: 'GAME_MODES',
          useValue: this.gameModes,
        },
      ],
    }
  }

  static register(params: GameModeConfig): DynamicModule {
    if (params.isRanked && params.autenticated)
      throw new Error('Ranked gamemodes must be authenticated')

    for (const mode of this.gameModes)
      if (mode.gameModeAlias === params.gameModeAlias)
        throw new Error('Game mode alias already in use')

    this.gameModes.push(params)

    const module: DynamicModule = {
      module: GameModule,
      imports: [QueueModule.register(params)],
    }

    return module
  }
}
