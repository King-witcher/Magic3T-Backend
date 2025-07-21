import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { DocumentData, FirestoreDataConverter } from 'firebase-admin/firestore'
import { BaseRepository } from '../base-repository'
import { ConfigRepository } from '../config'
import { IconAssignmentModel } from './icon-assignment.model'
import { GlickoModel, UserModel } from '@magic3t/types'

@Injectable()
export class UserRepository extends BaseRepository<UserModel> {
  private user_logger = new Logger(UserRepository.name, { timestamp: true })
  private iconAssignmentConverter: FirestoreDataConverter<
    IconAssignmentModel,
    DocumentData
  >

  constructor(
    databaseService: DatabaseService,
    firebaseService: FirebaseService,
    private configService: ConfigRepository
  ) {
    super(firebaseService.firestore, databaseService, 'users')
    this.iconAssignmentConverter =
      databaseService.getConverter<IconAssignmentModel>()
  }

  getUniqueId(nickname: string): string {
    return nickname.toLowerCase().replaceAll(' ', '')
  }

  async getByNickname(nickname: string): Promise<UserModel | null> {
    const uniqueId = this.getUniqueId(nickname)
    const query = this.collection
      .where('identification.unique_id', '==', uniqueId)
      .limit(1)
    const result = await query.get()
    if (result.empty) return null
    this.user_logger.verbose(
      `read user by nickname ${nickname} best players from.`
    )
    return result.docs[0].data()
  }

  async updateGlicko(id: string, glicko: GlickoModel) {
    await super.update({ _id: id, glicko })
    this.user_logger.verbose(`update glicko for user "${id}".`)
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
    this.user_logger.verbose(`update user "${userId}" nickname to ${nickname}.`)
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
    this.user_logger.verbose(`read ${limit} best players from.`)
    const rankingQuery = this.collection
      .orderBy('elo.score', 'desc')
      .limit(limit)
    const result = await rankingQuery.get()
    const players = result.docs.map((doc) => doc.data())
    return players
  }

  /**
   * Gets all icon assigments for a given user.
   */
  async getIconAssignments(userId: string): Promise<IconAssignmentModel[]> {
    const subCollection = this.firestore
      .collection(`${this.collectionName}/${userId}/icon_assignments`)
      .withConverter(this.iconAssignmentConverter)

    const assignmentsSnap = await subCollection.orderBy('date', 'desc').get()
    return assignmentsSnap.docs.map((doc) => doc.data())
  }

  /**
   * Gets the icon assigment for a given user and a given icon, if any. Otherwise, return null.
   */
  async getIconAssignment(
    userId: string,
    iconId: number
  ): Promise<IconAssignmentModel | null> {
    const subCollection = this.firestore
      .collection(`${this.collectionName}/${userId}/icon_assignments`)
      .withConverter(this.iconAssignmentConverter)

    const assignmentSnap = await subCollection.doc(String(iconId)).get()
    return assignmentSnap.data() ?? null
  }

  /**
   * Grants an icon to a certain user.
   */
  async grantIcon(userId: string, iconId: number): Promise<void> {
    const subCollection = this.firestore
      .collection(`${this.collectionName}/${userId}/icon_assignments`)
      .withConverter(this.iconAssignmentConverter)

    await subCollection.doc(String(iconId)).set({
      _id: '',
      date: new Date(),
    })
  }
}
