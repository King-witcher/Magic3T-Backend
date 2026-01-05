import { Global, Module } from '@nestjs/common'
import { FirebaseModule } from '@/firebase'
import { ConfigRepository } from './config'
import { DatabaseService } from './database.service'
import { MatchRepository } from './match'
import { UserRepository } from './user'

@Global()
@Module({
  imports: [FirebaseModule],
  providers: [DatabaseService, UserRepository, MatchRepository, ConfigRepository],
  exports: [DatabaseService, UserRepository, MatchRepository, ConfigRepository],
})
export class DatabaseModule {}
