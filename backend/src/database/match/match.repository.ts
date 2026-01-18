import { Team } from '@magic3t/common-types'
import { MatchRow } from '@magic3t/database-types'
import { Injectable, Logger } from '@nestjs/common'
import { FieldPath, Filter } from 'firebase-admin/firestore'
import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'
import { BaseFirestoreRepository } from '../base-repository'
import { ListResult } from '../types/query-types'

@Injectable()
export class MatchRepository extends BaseFirestoreRepository<MatchRow> {
  matchLogger = new Logger(MatchRepository.name, { timestamp: true })

  constructor(databaseService: DatabaseService, firebaseService: FirebaseService) {
    super(firebaseService.firestore, databaseService, 'matches')
  }

  /**
   *  Queries for all matches played by a user, sorted by
   * @param id The user id
   * @param limit How many docs should be fetched
   */
  async getByUser(id: string, limit: number): Promise<ListResult<MatchRow>> {
    this.matchLogger.verbose(`read ${limit} matches from user ${id}.`)
    const query = this.collection
      .where(
        Filter.or(
          Filter.where(`${Team.Chaos}.uid`, '==', id),
          Filter.where(`${Team.Order}.uid`, '==', id)
        )
      )
      .orderBy(FieldPath.documentId())
      .limit(limit)

    const querySnap = await query.get()

    return querySnap.docs.map((doc) => ({
      id: doc.id,
      createdAt: doc.createTime.toDate(),
      updatedAt: doc.updateTime?.toDate(),
      data: doc.data(),
    }))
  }
}
