import { Module } from '@nestjs/common'

import { AuthModule } from '@/auth/auth.module'
import { SocketsService } from '@/common'
import { GlickoRatingStrategy, RatingModule } from '@/rating'
import { MatchBank } from './lib/match-bank'
import { MatchController } from './match.controller'
import { MatchGateway } from './match.gateway'
import * as services from './services'
import { MatchSocketEmitMap } from './types'

@Module({
  imports: [AuthModule, RatingModule.register(GlickoRatingStrategy)],
  controllers: [MatchController],
  providers: [
    MatchGateway,
    MatchBank,
    ...Object.values(services),
    {
      provide: 'MatchSocketsService',
      useClass: SocketsService<MatchSocketEmitMap>,
    },
  ],
  exports: [services.MatchService, 'MatchSocketsService'],
})
export class MatchModule {}
