import { DatabaseService } from '@/database/database.service'
import { MatchModel } from '@/database/match/match.model'
import { FirebaseService } from '@/firebase/firebase.service'
import { Injectable } from '@nestjs/common'
import { BaseRepository } from '../base-repository'

@Injectable()
export class MatchRepository extends BaseRepository<MatchModel> {
  constructor(
    databaseService: DatabaseService,
    firebaseService: FirebaseService
  ) {
    super(firebaseService.firestore, databaseService, 'matches')
  }
}
