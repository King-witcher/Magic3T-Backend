import { Global, Module } from '@nestjs/common'
import { CasualGameConfig, RankedGameConfig } from './config.symbols'
import { GameConfig } from './config.types'

const casual: GameConfig = {
  timeLimit: 120,
}

@Global()
@Module({
  providers: [
    {
      provide: CasualGameConfig,
      useValue: casual,
    },
    {
      provide: RankedGameConfig,
      useValue: casual,
    },
  ],
  exports: [CasualGameConfig],
})
export class ConfigModule {}
