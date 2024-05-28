import { Injectable } from '@nestjs/common'
import { BaseModelService } from '@/database/base-model-service'
import { Glicko, UserModel } from '@/database/users/user.model'
import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'

@Injectable()
export class UsersService extends BaseModelService<UserModel> {
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
