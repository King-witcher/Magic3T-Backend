import { Module } from '@nestjs/common'
import { QueueService } from './queue/queue.service'
import { QueueGateway } from './queue/queue.gateway'
import { MatchService } from './match/match.service'
import { GameController } from './game.controller'
import { MatchGateway } from './match/match.gateway'
import { MatchGuard } from './match/match.guard'

@Module({
  controllers: [GameController],
  providers: [QueueService, QueueGateway, MatchService, MatchGateway],
})
export class GameModule {}
