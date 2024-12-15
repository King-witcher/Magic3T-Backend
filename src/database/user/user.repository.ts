import {
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common'
import { Glicko, UserModel } from '@/database/user/user.model'
import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'
import { ConfigRepository } from '../config'
import { BaseRepository } from '../base-repository'

@Injectable()
export class UserRepository extends BaseRepository<UserModel> {
  constructor(
    databaseService: DatabaseService,
    firebaseService: FirebaseService,
    private configService: ConfigRepository,
  ) {
    super(firebaseService.firestore, databaseService, 'users')
  }

  async getByNickname(nickname: string): Promise<UserModel | null> {
    throw new NotImplementedException()
    // await this.collection.where()
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
