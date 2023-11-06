import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { GameModule } from './game/game.module'

@Module({
  imports: [GameModule],
  controllers: [AppController],
})
export class AppModule {}
