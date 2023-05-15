import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { RegistryModule } from '../registry/registry.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [RegistryModule, ProfileModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
