import { Injectable } from '@nestjs/common'
import { FirebaseService } from '@/firebase/firebase.service'
import { DatabaseService } from '@/database/database.service'
import {
  BotConfigModel,
  RatingConfigModel,
  BotName,
} from '@/database/config/models'
import { firestore } from 'firebase-admin'
import CollectionReference = firestore.CollectionReference
import { CacheMethod } from '@common'

@Injectable()
export class ConfigService {
  private collection: CollectionReference

  constructor(
    firestoreService: FirebaseService,
    private databaseService: DatabaseService,
  ) {
    this.collection = firestoreService.firestore.collection('config')
  }

  @CacheMethod(300)
  async getBotConfigs() {
    console.info('%cFirestore: Read "bots" from config.', 'color: #FFCA28')

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

  @CacheMethod(300)
  async getRatingConfig(): Promise<RatingConfigModel> {
    console.info('%cFirestore: Read "rating" from config.', 'color: #FFCA28')
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
