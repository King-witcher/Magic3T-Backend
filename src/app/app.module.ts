import { MiddlewareConsumer, Module } from '@nestjs/common'
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

@Module({
  imports: [
    GameModule,
    RegistryModule,
    SessionModule,
    QueueModule,
    ProfileModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      username: process.env.PG_USERNAME,
      host: process.env.PG_HOST,
      database: process.env.PG_NAME,
      ssl: true,
      entities: [Registry, Profile],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*')
  }
}
