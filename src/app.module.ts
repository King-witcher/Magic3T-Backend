import { Global, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { QueueModule } from '@modules/queue/queue.module'
import { RatingModule } from '@modules/rating/rating.module'
import { DatabaseModule } from '@modules/database/database.module'
import { FirebaseModule } from '@modules/firebase/firebase.module'
import { ConfigModule } from '@nestjs/config'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    QueueModule,
    RatingModule,
    DatabaseModule,
    FirebaseModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
