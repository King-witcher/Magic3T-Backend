import { Global, Module } from '@nestjs/common'
import { UsersService } from './users/users.service'
import { DatabaseService } from './database.service'
import { FirebaseModule } from '@modules/firebase/firebase.module'
import { MatchesService } from './matches/matches.service'
import { ConfigService } from './config/config.service'

@Global()
@Module({
  imports: [FirebaseModule],
  providers: [DatabaseService, UsersService, MatchesService, ConfigService],
  exports: [DatabaseService, UsersService, MatchesService, ConfigService],
})
export class DatabaseModule {}
