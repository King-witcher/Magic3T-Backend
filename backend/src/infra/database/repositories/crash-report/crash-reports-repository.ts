import { CrashReportRow } from '@magic3t/database-types'
import { Injectable, Logger } from '@nestjs/common'
import { DatabaseService } from '@/infra/database/database.service'
import { FirebaseService } from '@/infra/firebase/firebase.service'
import { BaseFirestoreRepository } from '../base-repository'

@Injectable()
export class CrashReportsRepository extends BaseFirestoreRepository<CrashReportRow> {
  matchLogger = new Logger(CrashReportsRepository.name, { timestamp: true })

  constructor(databaseService: DatabaseService, firebaseService: FirebaseService) {
    super(firebaseService.firestore, databaseService, 'crash-reports')
  }
}
