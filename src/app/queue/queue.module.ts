import { Module } from '@nestjs/common'

import { ProfileModule } from '../profile/profile.module'
import { SessionModule } from '../session/session.module'
import { GameModule } from '../game/game.module'
import { QueueGateway } from './queue.gateway'
import { QueueService } from './queue.service';

@Module({
  imports: [ProfileModule, ProfileModule, SessionModule, GameModule],
  providers: [QueueGateway, QueueService],
})
export class QueueModule {}
