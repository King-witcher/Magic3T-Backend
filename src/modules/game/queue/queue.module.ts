import { DynamicModule, Module, Provider } from '@nestjs/common'
import { QueueGateway } from './queue.gateway'
import { MatchModule } from '../match/match.module'
import { FirebaseModule } from '@/modules/firebase/firebase.module'
import { QueueGuard } from './queue.guard'

@Module({})
export class QueueModule {
  static register(params: GameModeConfig): DynamicModule {
    const gameModeConfigs: Provider = {
      provide: 'GAME_MODE_CONFIG',
      useValue: params,
    }

    return {
      module: QueueModule,
      imports: [MatchModule.register(params)],
      providers: [QueueGuard, QueueGateway, gameModeConfigs],
    }
  }
}
