import { Module } from '@nestjs/common'
import { QueueGateway } from './queue.gateway'
import { MatchModule } from '../match/match.module'
import { QueueGuard } from './queue.guard'

@Module({
  imports: [MatchModule],
  providers: [QueueGateway, QueueGuard],
})
export class QueueModule {}
