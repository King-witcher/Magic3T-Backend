import { Global, Module } from '@nestjs/common'
import { FirebaseModule } from '@/infra/firebase'
import { DatabaseService } from './database.service'

import {
  ConfigRepository,
  CrashReportsRepository,
  MatchRepository,
  UserRepository,
} from './repositories'

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
