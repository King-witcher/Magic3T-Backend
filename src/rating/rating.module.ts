import { DatabaseModule } from '@/database'
import { DynamicModule, Module, Provider, Type } from '@nestjs/common'
import { RatingService } from '.'
import { RatingStrategy } from './strategies'

@Module({})
export class RatingModule {
  static forRoot<U extends RatingStrategy>(
    ratingStrategy: Type<U>
  ): DynamicModule {
    const ratingStrategyProvider: Provider = {
      provide: RatingStrategy,
      useClass: ratingStrategy,
    }

    return {
      module: RatingModule,
      imports: [DatabaseModule],
      providers: [RatingService, ratingStrategyProvider],
      exports: [RatingService],
      global: true,
    }
  }
}
