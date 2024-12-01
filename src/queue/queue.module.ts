import { Module } from '@nestjs/common'
import { MatchModule } from '@/match'
import { DatabaseModule } from '@/database'
import { FirebaseModule } from '@/firebase'
import { QueueGateway } from './queue.gateway'
import { WsQueueGuard } from './guards/ws-queue.guard'
import { QueueService } from './queue.service'
import { SocketsService } from '@/common/services/sockets.service'
import { QueueEmitType } from './types'
import { QueueController } from './queue.controller'

export const QueueSocketsService = Symbol('QueueSocketsService')

@Module({
  controllers: [QueueController],
  imports: [MatchModule, DatabaseModule, FirebaseModule],
  providers: [
    QueueGateway,
    WsQueueGuard,
    QueueService,
    {
      provide: 'QueueSocketsService',
      useClass: SocketsService<QueueEmitType>,
    },
  ],
})
export class QueueModule {}
