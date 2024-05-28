import { Injectable } from '@nestjs/common'
import { FirebaseService } from '@modules/firebase/firebase.service'
import { DatabaseService } from '@modules/database/database.service'
import {
  BotConfigModel,
  RatingConfigModel,
  BotName,
} from '@modules/database/config/models'
import { firestore } from 'firebase-admin'
import CollectionReference = firestore.CollectionReference
import { CacheMethod } from '../decorators/cache-method.decorator'

@Injectable()
export class ConfigService {
  private collection: CollectionReference

  constructor(
    firestoreService: FirebaseService,
    private databaseService: DatabaseService,
  ) {
    this.collection = firestoreService.firestore.collection('config')
  }

  // TODO: Cache this request
  @CacheMethod(60)
  async getBotConfigs() {
    const converter = this.databaseService.getConverter<BotConfigModel>()
    const snapshot = await this.collection
      .withConverter(converter)
      .doc('bots')
      .get()

    const data = snapshot.data()

    if (!data) throw new Error('Couldn not find bot config.')

    return data
  }

  async getBotConfig(botName: BotName) {
    const botConfigs = await this.getBotConfigs()
    return botConfigs[botName] || null
  }

  @CacheMethod(60)
  async getRatingConfig(): Promise<RatingConfigModel> {
    const converter = this.databaseService.getConverter<RatingConfigModel>()
    const snapshot = await this.collection
      .withConverter(converter)
      .doc('rating')
      .get()

    const data = snapshot.data()

    if (!data) throw new Error('Couldn not find rating config.')

    return data
  }
}
