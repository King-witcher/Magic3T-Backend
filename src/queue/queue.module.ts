import { Module } from '@nestjs/common'
import { MatchModule } from '@/match'
import { DatabaseModule } from '@/database'
import { FirebaseModule } from '@/firebase'
import { QueueGateway } from './queue.gateway'
import { QueueGuard } from './queue.guard'
import { QueueService } from './queue.service'
import { SocketsService } from '@/common/services/sockets.service'
import { QueueEmitType } from './types'

export const QueueSocketsService = Symbol('QueueSocketsService')

@Module({
  imports: [MatchModule, DatabaseModule, FirebaseModule],
  providers: [
    QueueGateway,
    QueueGuard,
    QueueService,
    {
      provide: 'QueueSocketsService',
      useClass: SocketsService<QueueEmitType>,
    },
  ],
})
export class QueueModule {}
