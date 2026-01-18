import { CacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
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
    // {
    //   provide: 'APP_GUARD',
    //   useClass: MaintenanceGuard,
    // },
    AppGateway,
  ],
})
export class AppModule {}
