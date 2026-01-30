import { Module } from '@nestjs/common'
import { DatabaseModule } from '@/infra/database'
import { FirebaseModule } from '@/infra/firebase'
import { MatchModule } from '@/modules/match'
import { QueueController } from './queue.controller'
import { QueueGateway } from './queue.gateway'
import { QueueService } from './queue.service'

export const QueueSocketsService = Symbol('QueueSocketsService')

@Module({
  controllers: [QueueController],
  imports: [MatchModule, DatabaseModule, FirebaseModule],
  providers: [QueueGateway, QueueService],
})
export class QueueModule {}
