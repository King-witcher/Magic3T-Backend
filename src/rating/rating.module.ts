import { DatabaseModule } from '@/database'
import { DynamicModule, Module, Provider, Type } from '@nestjs/common'
import { RatingService } from '.'
import { RatingStrategy } from './strategies'

@Module({})
export class RatingModule {
  static register<T extends RatingStrategy>(
    ratingStrategy: Type<T>
  ): DynamicModule {
    const StrategyProvider: Provider = {
      provide: RatingStrategy,
      useClass: ratingStrategy,
    }

    return {
      module: RatingModule,
      imports: [DatabaseModule],
      providers: [RatingService, StrategyProvider],
      exports: [RatingService],
    }
  }
}
