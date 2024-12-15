import { Global, Module } from '@nestjs/common'
import { FirebaseModule } from '@/firebase'
import { DatabaseService } from './database.service'
import { UserRepository } from './user'
import { MatchRepository } from './match'
import { ConfigRepository } from './config'

@Global()
@Module({
  imports: [FirebaseModule],
  providers: [
    DatabaseService,
    UserRepository,
    MatchRepository,
    ConfigRepository,
  ],
  exports: [DatabaseService, UserRepository, MatchRepository, ConfigRepository],
})
export class DatabaseModule {}
