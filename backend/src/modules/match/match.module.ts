import { Module } from '@nestjs/common'
import { ClientSyncService } from './client-sync.service'
import { MatchBank } from './lib/match-bank'
import { MatchController } from './match.controller'
import { MatchGateway } from './match.gateway'
import { MatchService } from './match.service'
import { PersistanceService } from './persistance.service'

@Module({
  controllers: [MatchController],
  providers: [MatchGateway, MatchBank, MatchService, PersistanceService, ClientSyncService],
  exports: [MatchService],
})
export class MatchModule {}
