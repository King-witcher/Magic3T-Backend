import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { BaseModelService } from '@/database/base-model-service'
import { Glicko, UserModel } from '@/database/users/user.model'
import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'
import { ConfigService } from '../config'

@Injectable()
export class UsersService extends BaseModelService<UserModel> {
  constructor(
    databaseService: DatabaseService,
    firebaseService: FirebaseService,
    private configService: ConfigService,
  ) {
    super(firebaseService.firestore, databaseService, 'users')
  }

  async updateGlicko(id: string, glicko: Glicko) {
    await super.update({ _id: id, glicko })
  }

  /// Gets all bot profiles, sorted by the bot name (bot0, bot1, bot2 and bot3)
  async getBots(): Promise<UserModel[]> {
    const bots = await this.configService.getBotConfigs()
    const uids = [bots.bot0.uid, bots.bot1.uid, bots.bot2.uid, bots.bot3.uid]
    return await Promise.all(
      uids.map(async (uid) => {
        const user = await super.get(uid)
        if (!user)
          throw new InternalServerErrorException(
            `user not found for bot ${uid}`,
          )
        return user
      }),
    )
  }
}
