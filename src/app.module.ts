import { Module } from '@nestjs/common'
import { GameModule } from './modules/game/game.module';
import { TypeOrmModule } from '@nestjs/typeorm'
import { Registry } from './entities/Registry'
import { RegistryModule } from './modules/registry/registry.module'
import { AppController } from './app.controller';
import { SessionModule } from './modules/session/session.module';
import { Profile } from './entities/Profile';

@Module({
  imports: [
    GameModule,
    RegistryModule,
    SessionModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSSWORD,
      host: process.env.PG_HOST,
      database: process.env.PG_NAME,
      ssl: true,
      entities: [Registry, Profile],
      synchronize: true
    }),
  ],
  controllers: [AppController],
  providers: [],

})
export class AppModule {}