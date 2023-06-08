import { Module } from '@nestjs/common'
import { SessionController } from './session.controller'
import { SessionService } from './session.service'
import { RegistryModule } from '../registry/registry.module'
import { ProfileModule } from '../profile/profile.module'
import { SessionMiddleware } from './session.middleware'

@Module({
  imports: [RegistryModule, ProfileModule],
  controllers: [SessionController],
  providers: [SessionService, SessionMiddleware],
  exports: [SessionService, SessionMiddleware],
})
export class SessionModule {}
