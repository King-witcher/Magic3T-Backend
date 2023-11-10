import { Module } from '@nestjs/common'
import { QueueGateway } from './queue.gateway'
import { MatchModule } from '../match/match.module'
import { QueueGuard } from './queue.guard'
import { QueueService } from './queue.service'
import { SocketsService } from './sockets.service'

@Module({
  imports: [MatchModule],
  providers: [QueueGateway, QueueGuard, QueueService, SocketsService],
})
export class QueueModule {}
