import { Global, Module } from '@nestjs/common'
import { FirebaseModule } from '@/firebase'
import { ConfigService, DatabaseService, MatchesService, UsersService } from '.'

@Global()
@Module({
  imports: [FirebaseModule],
  providers: [DatabaseService, UsersService, MatchesService, ConfigService],
  exports: [DatabaseService, UsersService, MatchesService, ConfigService],
})
export class DatabaseModule {}
