import { Global, Module } from '@nestjs/common'
import { FirebaseModule } from '@/firebase'
import { ConfigRepository } from './config'
import { DatabaseService } from './database.service'
import { MatchRepository } from './match'
import { UserRepository } from './user'
import { CrashReportRepository } from './crash-report'

@Global()
@Module({
  imports: [FirebaseModule],
  providers: [DatabaseService, UserRepository, MatchRepository, ConfigRepository, CrashReportRepository],
  exports: [DatabaseService, UserRepository, MatchRepository, ConfigRepository, CrashReportRepository],
})
export class DatabaseModule {}
