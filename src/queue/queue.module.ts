import { AuthModule } from '@/auth/auth.module'
import { SocketsService } from '@/common/services/sockets.service'
import { DatabaseModule } from '@/database'
import { FirebaseModule } from '@/firebase'
import { MatchModule } from '@/match'
import { Module } from '@nestjs/common'
import { QueueController } from './queue.controller'
import { QueueGateway } from './queue.gateway'
import { QueueService } from './queue.service'
import { QueueEmitType } from './types'

export const QueueSocketsService = Symbol('QueueSocketsService')

@Module({
  controllers: [QueueController],
  imports: [MatchModule, DatabaseModule, AuthModule, FirebaseModule],
  providers: [
    QueueGateway,
    QueueService,
    {
      provide: 'QueueSocketsService',
      useClass: SocketsService<QueueEmitType>,
    },
  ],
})
export class QueueModule {}
