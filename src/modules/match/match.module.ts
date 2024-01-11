import { Module } from '@nestjs/common'
import { MatchGateway } from './match.gateway'
import { MatchService } from './match.service'
import { SocketsService } from '../sockets.service'
import { PlayerEmitType } from './types/PlayerSocket'
import { MatchController } from './match.controller'

@Module({
  controllers: [MatchController],
  providers: [MatchGateway, MatchService, SocketsService<PlayerEmitType>],
  exports: [MatchService],
})
export class MatchModule {}
