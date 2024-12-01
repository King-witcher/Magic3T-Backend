import { Global, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { QueueModule } from '@/queue/queue.module'
import { DatabaseModule } from '@/database/database.module'
import { FirebaseModule } from '@/firebase/firebase.module'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    QueueModule,
    DatabaseModule,
    FirebaseModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
