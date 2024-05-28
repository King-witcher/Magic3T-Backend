import { Global, Module } from '@nestjs/common'
import { FirebaseModule } from '@/firebase'
import { DatabaseService } from './database.service'
import { UsersService } from './users'
import { MatchesService } from './matches'
import { ConfigService } from './config'

@Global()
@Module({
  imports: [FirebaseModule],
  providers: [DatabaseService, UsersService, MatchesService, ConfigService],
  exports: [DatabaseService, UsersService, MatchesService, ConfigService],
})
export class DatabaseModule {}
