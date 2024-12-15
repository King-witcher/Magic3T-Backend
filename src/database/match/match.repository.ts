import { Injectable } from '@nestjs/common'
import { MatchModel } from '@/database/match/match.model'
import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'
import { BaseRepository } from '../base-repository'

@Injectable()
export class MatchRepository extends BaseRepository<MatchModel> {
  constructor(
    databaseService: DatabaseService,
    firebaseService: FirebaseService,
  ) {
    super(firebaseService.firestore, databaseService, 'matches')
  }
}
