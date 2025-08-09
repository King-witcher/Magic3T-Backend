import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'
import { Injectable, Logger } from '@nestjs/common'
import { firestore } from 'firebase-admin'
import CollectionReference = firestore.CollectionReference
import { CacheMethod } from '@common'
import {
  BotConfigModel,
  BotName,
  DevopsConfigModel,
  RatingConfigModel,
} from '@magic3t/types'

@Injectable()
export class ConfigRepository {
  private readonly logger = new Logger(ConfigRepository.name, {
    timestamp: true,
  })
  private collection: CollectionReference

  constructor(
    firestoreService: FirebaseService,
    private databaseService: DatabaseService
  ) {
    this.collection = firestoreService.firestore.collection('config')
  }

  @CacheMethod(300)
  async getBotConfigs() {
    this.logger.verbose('read "bots" from config')

    const converter = this.databaseService.getConverter<BotConfigModel>()
    const snapshot = await this.collection
      .withConverter(converter)
      .doc('bots')
      .get()

    const data = snapshot.data()

    if (!data) throw new Error('couldn not find bot config')

    return data
  }

  async getBotConfig(botName: BotName) {
    const botConfigs = await this.getBotConfigs()
    return botConfigs[botName] || null
  }

  @CacheMethod(10)
  async getDevopsConfig(): Promise<DevopsConfigModel> {
    this.logger.verbose('read "devops" from config')
    const converter = this.databaseService.getConverter<DevopsConfigModel>()
    const snapshot = await this.collection
      .withConverter(converter)
      .doc('devops')
      .get()

    const data = snapshot.data()

    if (!data) throw new Error('could not find devops config')

    return data
  }

  @CacheMethod(300)
  async cachedGetRatingConfig(): Promise<RatingConfigModel> {
    this.logger.verbose('read "rating" from config')
    const converter = this.databaseService.getConverter<RatingConfigModel>()
    const snapshot = await this.collection
      .withConverter(converter)
      .doc('rating')
      .get()

    const data = snapshot.data()

    if (!data) throw new Error('couldn not find rating config')

    return data
  }
}
