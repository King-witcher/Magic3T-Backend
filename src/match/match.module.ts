import { Module } from '@nestjs/common'

import { SocketsService } from '@/common'
import { GameServerEventsMap } from '@magic3t/types'
import { MatchBank } from './lib/match-bank'
import { MatchController } from './match.controller'
import { MatchGateway } from './match.gateway'
import { MatchService } from './match.service'
import { MatchObserverService } from './state-report.service'

@Module({
  controllers: [MatchController],
  providers: [
    MatchGateway,
    MatchBank,
    MatchService,
    MatchObserverService,
    {
      provide: 'MatchSocketsService',
      useClass: SocketsService<GameServerEventsMap>,
    },
  ],
  exports: [MatchService, 'MatchSocketsService'],
})
export class MatchModule {}
