import { DynamicModule, Module, Provider } from '@nestjs/common'
import { MatchGateway } from './match.gateway'
import { MatchService } from './match.service'
import { FirebaseModule } from '@/modules/firebase/firebase.module'

@Module({})
export class MatchModule {
  static register(params: GameModeConfig): DynamicModule {
    const gameModeConfig: Provider = {
      provide: 'GAME_MODE_CONFIG',
      useValue: params,
    }
    return {
      module: MatchModule,
      imports: [],
      providers: [MatchGateway, MatchService, gameModeConfig],
      exports: [MatchService],
    }
  }
}
