import { DynamicModule, Module, Provider, Type } from '@nestjs/common'
import { RatingStrategy } from './strategies'
import { DatabaseModule } from '@/database'
import { RatingService } from '.'

@Module({})
export class RatingModule {
  static register<T extends RatingStrategy>(
    ratingStrategy: Type<T>,
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
