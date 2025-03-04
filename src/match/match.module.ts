import { Module } from '@nestjs/common'

import { SocketsService } from '@/common'
import { MatchBank } from './lib/match-bank'
import { MatchController } from './match.controller'
import { MatchGateway } from './match.gateway'
import { MatchService } from './match.service'
import { MatchServerEventsMap } from './types'

@Module({
  controllers: [MatchController],
  providers: [
    MatchGateway,
    MatchBank,
    MatchService,
    {
      provide: 'MatchSocketsService',
      useClass: SocketsService<MatchServerEventsMap>,
    },
  ],
  exports: [MatchService, 'MatchSocketsService'],
})
export class MatchModule {}
