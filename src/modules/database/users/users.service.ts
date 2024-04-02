import { Injectable } from '@nestjs/common'
import { ModelService } from '@modules/database/lib/modelService'
import { Glicko, UserModel } from '@modules/database/users/user.model'
import { DatabaseService } from '@modules/database/database.service'
import { FirebaseService } from '@modules/firebase/firebase.service'

@Injectable()
export class UsersService extends ModelService<UserModel> {
  constructor(
    databaseService: DatabaseService,
    firebaseService: FirebaseService,
  ) {
    super(firebaseService.firestore, databaseService, 'users')
  }

  async updateGlicko(id: string, glicko: Glicko) {
    await super.update({ _id: id, glicko })
  }
}
