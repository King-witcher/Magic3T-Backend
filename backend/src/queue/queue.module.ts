import { QueueServerEventsMap } from '@magic3t/api-types'
import { Module } from '@nestjs/common'
import { SocketsService } from '@/common/services/sockets.service'
import { DatabaseModule } from '@/database'
import { FirebaseModule } from '@/firebase'
import { MatchModule } from '@/match'
import { QueueController } from './queue.controller'
import { QueueGateway } from './queue.gateway'
import { QueueService } from './queue.service'

export const QueueSocketsService = Symbol('QueueSocketsService')

@Module({
  controllers: [QueueController],
  imports: [MatchModule, DatabaseModule, FirebaseModule],
  providers: [
    QueueGateway,
    QueueService,
    {
      provide: 'QueueSocketsService',
      useClass: SocketsService<QueueServerEventsMap>,
    },
  ],
})
export class QueueModule {}
