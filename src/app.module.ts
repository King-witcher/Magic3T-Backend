import { DatabaseModule } from '@/database/database.module'
import { FirebaseModule } from '@/firebase/firebase.module'
import { QueueModule } from '@/queue/queue.module'
import { CacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AdminModule } from './admin/admin.module'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { GlickoStrategy, LeaguesStrategy, RatingModule } from './rating'
import { UserModule } from './user/user.module'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    CacheModule.register({
      isGlobal: true,
    }),
    RatingModule.forRoot(GlickoStrategy, LeaguesStrategy),
    AuthModule,
    QueueModule,
    DatabaseModule,
    FirebaseModule,
    UserModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
