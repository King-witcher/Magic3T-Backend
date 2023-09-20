import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { ProfileModule } from '../profile/profile.module';
import { SessionModule } from '../session/session.module';
import { GameModule } from '../game/game.module';
import { QueueGateway } from './queue.gateway';

@Module({
  imports: [ProfileModule, ProfileModule, SessionModule, GameModule],
  controllers: [QueueController],
  providers: [QueueService, QueueGateway],
})
export class QueueModule {}
