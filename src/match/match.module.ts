import { Module } from '@nestjs/common'
import { MatchGateway } from './match.gateway'
import { SocketsService } from '../common/services/sockets.service'
import { MatchSocketEmitMap } from './types/MatchSocket'
import { MatchController } from './match.controller'
import { DatabaseModule } from '@/database/database.module'
import { RatingModule } from '../rating/rating.module'
import { GlickoRatingStrategy } from '../rating/strategies/glicko-rating-strategy'
import { FirebaseModule } from '../firebase/firebase.module'

import * as services from './services'

@Module({
  imports: [
    DatabaseModule,
    FirebaseModule,
    RatingModule.register(GlickoRatingStrategy),
  ],
  controllers: [MatchController],
  providers: [
    MatchGateway,
    ...Object.values(services),
    {
      provide: 'MatchSocketsService',
      useClass: SocketsService<MatchSocketEmitMap>,
    },
  ],
  exports: [services.MatchService, 'MatchSocketsService'],
})
export class MatchModule {}
