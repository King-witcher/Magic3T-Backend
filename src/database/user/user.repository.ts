import { DatabaseService } from '@/database/database.service'
import { RatingModel, UserModel } from '@/database/user/user.model'
import { FirebaseService } from '@/firebase/firebase.service'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { BaseRepository } from '../base-repository'
import { ConfigRepository } from '../config'

@Injectable()
export class UserRepository extends BaseRepository<UserModel> {
  constructor(
    databaseService: DatabaseService,
    firebaseService: FirebaseService,
    private configService: ConfigRepository
  ) {
    super(firebaseService.firestore, databaseService, 'users')
  }

  getUniqueId(nickname: string): string {
    return nickname.toLowerCase().replace(' ', '')
  }

  async getByNickname(nickname: string): Promise<UserModel | null> {
    const uniqueId = this.getUniqueId(nickname)
    const query = this.collection
      .where('identification.unique_id', '==', uniqueId)
      .limit(1)
    const result = await query.get()
    if (result.empty) return null
    return result.docs[0].data()
  }

  async updateGlicko(id: string, glicko: RatingModel) {
    await super.update({ _id: id, glicko })
  }

  async updateNickname(userId: string, nickname: string) {
    const uniqueId = this.getUniqueId(nickname)
    await this.collection.doc(userId).update({
      identification: {
        nickname,
        unique_id: uniqueId,
        last_changed: new Date(),
      },
    })
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
            `user not found for bot ${uid}`
          )
        return user
      })
    )
  }

  /**
   * Gets the best ranked players in the database, up to a maximum.
   * @param limit The amount of players to be fetched
   * @returns The `limit` best ranked players
   */
  async getBest(limit: number): Promise<UserModel[]> {
    this.logger.verbose(`read ${limit} best players from.`)
    const rankingQuery = this.collection
      .orderBy('glicko.rating', 'desc')
      .limit(limit)
    const result = await rankingQuery.get()
    const players = result.docs.map((doc) => doc.data())
    return players
  }
}
