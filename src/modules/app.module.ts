import { MiddlewareConsumer, Module, Provider } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Registry } from '../models/Registry'
import { RegistryModule } from './registry/registry.module'
import { AppController } from './app.controller'
import { Profile } from '../models/Profile'
import { ProfileModule } from './profile/profile.module'
import { AuthModule } from './auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'
import { GameModule } from './game/game.module'

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
    RegistryModule,
    ProfileModule,
    DatabaseModule,
    AuthModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppGuard],
})
export class AppModule {}
