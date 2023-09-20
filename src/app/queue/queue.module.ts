import { Module } from '@nestjs/common';

import { ProfileModule } from '../profile/profile.module';
import { SessionModule } from '../session/session.module';
import { GameModule } from '../game/game.module';
import { QueueGateway } from './queue.gateway';

@Module({
  imports: [ProfileModule, ProfileModule, SessionModule, GameModule],
  controllers: [],
  providers: [QueueGateway],
})
export class QueueModule {}
