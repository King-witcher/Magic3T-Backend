import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { GameModule } from './game/game.module'
import { FirebaseModule } from './firebase/firebase.module'

@Module({
  imports: [
    GameModule.forRoot(),
    GameModule.register({
      gameModeAlias: 'public',
      gameModeName: 'Public Match',
      autenticated: false,
      isRanked: false,
      timeLimit: 105,
    }),
    FirebaseModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
