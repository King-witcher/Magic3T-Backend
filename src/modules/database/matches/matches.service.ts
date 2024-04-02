import { Injectable } from '@nestjs/common'
import { ModelService } from '@modules/database/lib/modelService'
import { MatchModel } from '@modules/database/matches/match.model'
import { DatabaseService } from '@modules/database/database.service'
import { FirebaseService } from '@modules/firebase/firebase.service'

@Injectable()
export class MatchesService extends ModelService<MatchModel> {
  constructor(
    databaseService: DatabaseService,
    firebaseService: FirebaseService,
  ) {
    super(firebaseService.firestore, databaseService, 'matches')
  }
}
