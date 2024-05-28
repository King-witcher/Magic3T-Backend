import { Global, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { QueueModule } from '@/queue/queue.module'
import { DatabaseModule } from '@/database/database.module'
import { FirebaseModule } from '@/firebase/firebase.module'
import { ConfigModule } from '@nestjs/config'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    QueueModule,
    DatabaseModule,
    FirebaseModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
