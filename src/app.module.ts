import { Module } from '@nestjs/common'
import { SessionController } from './controllers/session/session.controller'
import { CheatsheetController } from './controllers/cheatsheet/cheatsheet.controller'
import { ServiceService } from './controllers/cheatsheet/service/service.service'
import { SessionService } from './services/session/session.service'
import { UsersService } from './services/users/users.service'
import { RegistersService } from './services/registers/registers.service'
import { TeapotController } from './controllers/teapot/teapot.controller';

@Module({
  imports: [],
  controllers: [SessionController, CheatsheetController, TeapotController],
  providers: [ServiceService, SessionService, UsersService, RegistersService],
})
export class AppModule {}
