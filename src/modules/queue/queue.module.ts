import { Module } from '@nestjs/common'
import { QueueGateway } from './queue.gateway'
import { MatchModule } from '../match/match.module'
import { QueueGuard } from './queue.guard'
import { QueueService } from './queue.service'

@Module({
  imports: [MatchModule],
  providers: [QueueGateway, QueueGuard, QueueService],
})
export class QueueModule {}
