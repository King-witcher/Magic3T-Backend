import { Global, Module } from '@nestjs/common'
import { FirebaseModule } from '@/firebase'
import { ConfigRepository } from './config'
import { CrashReportsRepository } from './crash-report'
import { DatabaseService } from './database.service'
import { MatchRepository } from './match'
import { UserRepository } from './user'

@Global()
@Module({
  imports: [FirebaseModule],
  providers: [
    DatabaseService,
    UserRepository,
    MatchRepository,
    ConfigRepository,
    CrashReportsRepository,
  ],
  exports: [
    DatabaseService,
    UserRepository,
    MatchRepository,
    ConfigRepository,
    CrashReportsRepository,
  ],
})
export class DatabaseModule {}
