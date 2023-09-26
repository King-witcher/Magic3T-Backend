import { Module } from '@nestjs/common'
import { QueueGateway } from './queue/queue.gateway'
import { MatchService } from './match/match.service'
import { GameController } from './game.controller'
import { MatchGateway } from './match/match.gateway'

@Module({
  controllers: [GameController],
  providers: [QueueGateway, MatchService, MatchGateway],
})
export class GameModule {}
