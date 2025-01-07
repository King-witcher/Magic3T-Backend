import { DatabaseModule } from '@/database'
import { DynamicModule, Module, Provider, Type } from '@nestjs/common'
import { RatingService } from '.'
import { UpdatingStrategy } from './strategies'

interface Params {
  udpatingStrategy: UpdatingStrategy
}

@Module({})
export class RatingModule {
  static forRoot<T extends UpdatingStrategy>(
    ratingStrategy: Type<T>
  ): DynamicModule {
    const StrategyProvider: Provider = {
      provide: UpdatingStrategy,
      useClass: ratingStrategy,
    }

    return {
      module: RatingModule,
      imports: [DatabaseModule],
      providers: [RatingService, StrategyProvider],
      exports: [RatingService],
      global: true,
    }
  }
}
