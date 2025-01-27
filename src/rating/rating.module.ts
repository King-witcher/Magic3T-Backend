import { DatabaseModule } from '@/database'
import { DynamicModule, Module, Provider, Type } from '@nestjs/common'
import { RatingService } from '.'
import { PresentationStrategy } from './presentation-strategies'
import { UpdatingStrategy } from './updating-strategies'

interface Params {
  udpatingStrategy: UpdatingStrategy
}

@Module({})
export class RatingModule {
  static forRoot<U extends UpdatingStrategy, P extends PresentationStrategy>(
    updatingStrategy: Type<U>,
    presentationStrategy: Type<P>
  ): DynamicModule {
    const updatingProvider: Provider = {
      provide: UpdatingStrategy,
      useClass: updatingStrategy,
    }

    const presentationProvider: Provider = {
      provide: PresentationStrategy,
      useClass: presentationStrategy,
    }

    return {
      module: RatingModule,
      imports: [DatabaseModule],
      providers: [RatingService, updatingProvider, presentationProvider],
      exports: [RatingService],
      global: true,
    }
  }
}
