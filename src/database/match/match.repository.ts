import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'
import { MatchRow, Team } from '@magic3t/types'
import { Injectable, Logger } from '@nestjs/common'
import { FieldPath, Filter } from 'firebase-admin/firestore'
import { BaseRepository } from '../base-repository'

@Injectable()
export class MatchRepository extends BaseRepository<MatchRow> {
  matchLogger = new Logger(MatchRepository.name, { timestamp: true })

  constructor(
    databaseService: DatabaseService,
    firebaseService: FirebaseService
  ) {
    super(firebaseService.firestore, databaseService, 'matches')
  }

  /**
   *  Queries for all matches played by a user, sorted by
   * @param id The user id
   * @param limit How many docs should be fetched
   */
  async getByUser(id: string, limit: number): Promise<MatchRow[]> {
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
    return querySnap.docs.map((doc) => doc.data())
  }
}
