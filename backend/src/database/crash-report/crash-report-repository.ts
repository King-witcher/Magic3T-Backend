import { CrashReportRow } from '@magic3t/database-types'
import { Injectable, Logger } from '@nestjs/common'
import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'
import { BaseFirestoreRepository } from '../base-repository'

@Injectable()
export class CrashReportRepository extends BaseFirestoreRepository<CrashReportRow> {
  matchLogger = new Logger(CrashReportRepository.name, { timestamp: true })

  constructor(databaseService: DatabaseService, firebaseService: FirebaseService) {
    super(firebaseService.firestore, databaseService, 'crash-reports')
  }
}
