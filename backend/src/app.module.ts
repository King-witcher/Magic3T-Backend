import { CacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { DatabaseModule } from '@/database/database.module'
import { FirebaseModule } from '@/firebase/firebase.module'
import { QueueModule } from '@/queue/queue.module'
import { AdminModule } from './admin/admin.module'
import { AppController } from './app.controller'
import { AppGateway } from './app.gateway'
import { AuthModule } from './auth/auth.module'
import { RatingModule } from './rating'
import { UserModule } from './user/user.module'

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60 * 1000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({ envFilePath: '.env' }),
    CacheModule.register({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    RatingModule,
    AuthModule,
    QueueModule,
    DatabaseModule,
    FirebaseModule,
    UserModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
    AppGateway,
  ],
})
export class AppModule {}
