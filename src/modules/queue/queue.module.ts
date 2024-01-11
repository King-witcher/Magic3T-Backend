import { Module } from '@nestjs/common'
import { QueueGateway } from './queue.gateway'
import { MatchModule } from '../match/match.module'
import { QueueGuard } from './queue.guard'
import { QueueService } from './queue.service'
import { SocketsService } from '../sockets.service'
import { QueueEmitType } from './types/QueueSocket'

@Module({
  imports: [MatchModule],
  providers: [
    QueueGateway,
    QueueGuard,
    QueueService,
    SocketsService<QueueEmitType>,
  ],
})
export class QueueModule {}
