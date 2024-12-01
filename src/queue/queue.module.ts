import { Module } from '@nestjs/common'
import { MatchModule } from '@/match'
import { DatabaseModule } from '@/database'
import { FirebaseModule } from '@/firebase'
import { QueueGateway } from './queue.gateway'
import { QueueService } from './queue.service'
import { SocketsService } from '@/common/services/sockets.service'
import { QueueEmitType } from './types'
import { QueueController } from './queue.controller'
import { AuthModule } from '@/auth/auth.module'

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
