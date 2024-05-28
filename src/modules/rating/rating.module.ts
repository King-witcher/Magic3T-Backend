import { DynamicModule, Module, Provider, Type } from '@nestjs/common'
import { RatingService } from './rating.service'
import { DatabaseModule } from '../database/database.module'
import { RatingStrategy } from './strategies/base-rating-strategy'

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
