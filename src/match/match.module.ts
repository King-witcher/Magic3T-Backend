import { Module } from '@nestjs/common'

import { DatabaseModule } from '@/database'
import { FirebaseModule } from '@/firebase'
import { SocketsService } from '@/common'
import { GlickoRatingStrategy, RatingModule } from '@/rating'
import { MatchController } from './match.controller'
import { MatchGateway } from './match.gateway'
import { MatchSocketEmitMap } from './types'
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
