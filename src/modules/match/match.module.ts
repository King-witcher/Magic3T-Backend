import { Module } from '@nestjs/common'
import { MatchGateway } from './match.gateway'
import { MatchService } from './match.service'
import { SocketsService } from '../sockets.service'
import { MatchSocketEmitMap } from './types/MatchSocket'
import { MatchController } from './match.controller'
import { FirebaseService } from '@modules/firebase/firebase.service'
import { DatabaseModule } from '@modules/database/database.module'
import { DatabaseSyncService } from './services/database-sync.service'
import { RatingModule } from '../rating/rating.module'
import { GlickoRatingStrategy } from '../rating/strategies/glicko-rating-strategy'

export const MatchSocketsService = Symbol('MatchSocketsService')

@Module({
  imports: [DatabaseModule, RatingModule.register(GlickoRatingStrategy)],
  controllers: [MatchController],
  providers: [
    MatchGateway,
    MatchService,
    DatabaseSyncService,
    FirebaseService,
    {
      provide: 'MatchSocketsService',
      useClass: SocketsService<MatchSocketEmitMap>,
    },
  ],
  exports: [MatchService, 'MatchSocketsService'],
})
export class MatchModule {}
