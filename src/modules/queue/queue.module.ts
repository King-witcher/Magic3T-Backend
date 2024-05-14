import { Module } from '@nestjs/common'
import { QueueGateway } from './queue.gateway'
import { MatchModule } from '../match/match.module'
import { QueueGuard } from './queue.guard'
import { QueueService } from './queue.service'
import { SocketsService } from '../sockets.service'
import { QueueEmitType } from './types/QueueSocket'
import { DatabaseModule } from '@modules/database/database.module'
import { FirebaseModule } from '@modules/firebase/firebase.module'
import { MatchSocketEmitMap } from '@modules/match/types/MatchSocket'

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
