import { DynamicModule, Module, Provider } from '@nestjs/common'
import { QueueGateway } from './queue.gateway'
import { AuthStrategy } from './strategies/AuthStrategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { PublicStrategy } from './strategies/public.strategy'
import { MatchModule } from '../match/match.module'

@Module({})
export class QueueModule {
  static register(params: GameModeConfig): DynamicModule {
    const authStrategy: Provider = {
      provide: AuthStrategy,
      useClass: params.autenticated ? JwtStrategy : PublicStrategy,
    }

    const gameModeConfigs: Provider = {
      provide: 'GAME_MODE_CONFIG',
      useValue: params,
    }

    return {
      module: QueueModule,
      imports: [MatchModule.register(params)],
      providers: [QueueGateway, authStrategy, gameModeConfigs],
    }
  }
}
