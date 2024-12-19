import { DatabaseModule } from '@/database/database.module'
import { FirebaseModule } from '@/firebase/firebase.module'
import { QueueModule } from '@/queue/queue.module'
import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AdminModule } from './admin/admin.module'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    QueueModule,
    DatabaseModule,
    FirebaseModule,
    AuthModule,
    UserModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
