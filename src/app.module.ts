import { MiddlewareConsumer, Module } from '@nestjs/common'
import { GameModule } from './modules/game/game.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Registry } from './entities/Registry'
import { RegistryModule } from './modules/registry/registry.module'
import { AppController } from './app.controller'
import { SessionModule } from './modules/session/session.module'
import { Profile } from './entities/Profile'
import { QueueModule } from './modules/queue/queue.module'
import { ProfileModule } from './modules/profile/profile.module'
import { SessionMiddleware } from './modules/session/session.middleware'

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
