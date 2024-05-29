import { Injectable } from '@nestjs/common'
import { BaseModelService } from '@/database/base-model-service'
import { MatchModel } from '@/database/matches/match.model'
import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'

@Injectable()
export class MatchesService extends BaseModelService<MatchModel> {
  constructor(
    databaseService: DatabaseService,
    firebaseService: FirebaseService,
  ) {
    super(firebaseService.firestore, databaseService, 'matches')
  }
}
