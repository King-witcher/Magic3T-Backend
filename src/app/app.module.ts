import { MiddlewareConsumer, Module, Provider } from '@nestjs/common'
import { GameModule } from './game/game.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Registry } from '../models/Registry'
import { RegistryModule } from './registry/registry.module'
import { AppController } from './app.controller'
import { SessionModule } from './session/session.module'
import { Profile } from '../models/Profile'
import { QueueModule } from './queue/queue.module'
import { ProfileModule } from './profile/profile.module'
import { SessionMiddleware } from './session/session.middleware'
import { ConfigModule } from './config/config.module'
import { AuthModule } from './auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'

const DatabaseModule = TypeOrmModule.forRoot({
  type: 'postgres',
  username: process.env.PG_USERNAME,
  host: process.env.PG_HOST,
  database: process.env.PG_NAME,
  ssl: false,
  entities: [Registry, Profile],
  synchronize: true,
})

const AppGuard: Provider = {
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}

@Module({
  imports: [
    GameModule,
    RegistryModule,
    SessionModule,
    QueueModule,
    ProfileModule,
    DatabaseModule,
    ConfigModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppGuard],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*')
  }
}
