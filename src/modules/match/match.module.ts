import { Module } from '@nestjs/common'
import { MatchGateway } from './match.gateway'
import { MatchService } from './match.service'
import { SocketsService } from '../sockets.service'
import { MatchSocketEmitMap } from './types/MatchSocket'
import { MatchController } from './match.controller'
import { FirebaseService } from '@modules/firebase/firebase.service'
import { DatabaseModule } from '@modules/database/database.module'

export const MatchSocketsService = Symbol('MatchSocketsService')

@Module({
  imports: [DatabaseModule],
  controllers: [MatchController],
  providers: [
    MatchGateway,
    MatchService,
    FirebaseService,
    {
      provide: 'MatchSocketsService',
      useClass: SocketsService<MatchSocketEmitMap>,
    },
  ],
  exports: [MatchService, 'MatchSocketsService'],
})
export class MatchModule {}
