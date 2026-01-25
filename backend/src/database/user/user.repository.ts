import { IconAssignmentRow, UserRow } from '@magic3t/database-types'
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { FirestoreDataConverter } from 'firebase-admin/firestore'
import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'
import { BaseFirestoreRepository } from '../base-repository'
import { ConfigRepository } from '../config'
import { GetResult, ListResult } from '../types/query-types'

@Injectable()
export class UserRepository extends BaseFirestoreRepository<UserRow> {
  private user_logger = new Logger(UserRepository.name, { timestamp: true })
  private iconAssignmentConverter: FirestoreDataConverter<IconAssignmentRow>

  constructor(
    databaseService: DatabaseService,
    firebaseService: FirebaseService,
    private configService: ConfigRepository
  ) {
    super(firebaseService.firestore, databaseService, 'users')
    this.iconAssignmentConverter = databaseService.getDefaultConverter<IconAssignmentRow>()
  }

  slugify(nickname: string): string {
    return nickname.toLowerCase().replaceAll(' ', '')
  }

  async getByNickname(nickname: string): Promise<GetResult<UserRow> | null> {
    const uniqueId = this.slugify(nickname)
    const query = this.collection.where('identification.unique_id', '==', uniqueId).limit(1)
    const snapshot = await query.get()
    if (snapshot.empty) return null
    this.user_logger.verbose(`read user by nickname ${nickname} best players from.`)
    const doc = snapshot.docs[0]
    const data = doc.data()

    return {
      id: doc.id,
      createdAt: doc.createTime.toDate(),
      updatedAt: doc.updateTime.toDate(),
      data: data,
    }
  }

  async updateNickname(id: string, nickname: string) {
    const uniqueId = this.slugify(nickname)
    await this.collection.doc(id).update({
      identification: {
        nickname,
        unique_id: uniqueId,
        last_changed: new Date(),
      },
    })
    this.user_logger.verbose(`update user "${id}" nickname to ${nickname}.`)
  }

  /// Gets all bot profiles, sorted by the bot name (bot0, bot1, bot2 and bot3)
  async getBots(): Promise<ListResult<UserRow>> {
    const bots = (await this.configService.getBotConfigs()).unwrap()
    const uids = [bots.bot0.uid, bots.bot1.uid, bots.bot2.uid, bots.bot3.uid]
    return await Promise.all(
      uids.map(async (uid) => {
        const user = await super.getById(uid)
        if (!user) throw new InternalServerErrorException(`user not found for bot ${uid}`)
        return user
      })
    )
  }

  /**
   * Gets the best ranked players in the database, up to a maximum.
   * @param minMatches The minimum amount of matches a player must have played to be considered
   * @param limit The amount of players to be fetched
   * @returns The `limit` best ranked players
   */
  async getBest(minMatches: number, limit: number): Promise<ListResult<UserRow>> {
    this.user_logger.verbose(`read ${limit} best players from.`)
    const rankingQuery = this.collection
      .orderBy('elo.score', 'desc')
      .where('elo.matches', '>', minMatches)
      .limit(limit)
    const result = await rankingQuery.get()
    const players = result.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        createdAt: doc.createTime.toDate(),
        updatedAt: doc.updateTime.toDate(),
        data: data,
      }
    })
    return players
  }

  /**
   * Gets all icon assigments for a given user.
   */
  async getIconAssignments(userId: string): Promise<ListResult<IconAssignmentRow>> {
    const subCollection = this.firestore
      .collection(`${this.collectionName}/${userId}/icon_assignments`)
      .withConverter(this.iconAssignmentConverter)

    const assignmentsSnap = await subCollection.orderBy('date', 'desc').get()
    return assignmentsSnap.docs.map((doc) => ({
      id: doc.id,
      createdAt: doc.createTime.toDate(),
      updatedAt: doc.updateTime.toDate(),
      data: doc.data(),
    }))
  }

  /**
   * Gets the icon assigment for a given user and a given icon, if any. Otherwise, return null.
   */
  async getIconAssignment(
    userId: string,
    iconId: number
  ): Promise<GetResult<IconAssignmentRow> | null> {
    const subCollection = this.firestore
      .collection(`${this.collectionName}/${userId}/icon_assignments`)
      .withConverter(this.iconAssignmentConverter)

    const assignmentSnap = await subCollection.doc(String(iconId)).get()
    const data = assignmentSnap.data()
    if (!assignmentSnap.exists || data === undefined) return null

    return {
      id: assignmentSnap.id,
      createdAt: assignmentSnap.createTime!.toDate(),
      updatedAt: assignmentSnap.updateTime!.toDate(),
      data,
    }
  }

  /**
   * Grants an icon to a certain user.
   */
  async grantIcon(userId: string, iconId: number): Promise<void> {
    const subCollection = this.firestore
      .collection(`${this.collectionName}/${userId}/icon_assignments`)
      .withConverter(this.iconAssignmentConverter)

    await subCollection.doc(String(iconId)).set({
      date: new Date(),
    })
  }
}
