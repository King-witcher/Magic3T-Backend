import { Injectable, Logger } from '@nestjs/common'
import { firestore } from 'firebase-admin'
import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'

import CollectionReference = firestore.CollectionReference

import { CacheMethod, unexpected } from '@common'
import {
  BotConfig,
  BotConfigRow,
  BotName,
  DevopsConfigModel as DevopsConfigRow,
  RatingConfigModel,
} from '@magic3t/types'

export type ConfigRepositoryError = 'configs-not-found' | 'bot-not-found'

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
  async getBotConfigs(): Promise<BotConfigRow> {
    this.logger.verbose('read "bots" from config')

    const converter = this.databaseService.getDefaultConverter<BotConfigRow>()
    const snapshot = await this.collection.withConverter(converter).doc('bots').get()

    const data = snapshot.data()

    if (!data) unexpected('Could not find bot configs in the database.')

    return data
  }

  async getBotConfig(botName: BotName): Promise<BotConfig | null> {
    const configs = await this.getBotConfigs()
    return configs[botName] ?? null
  }

  @CacheMethod(10)
  async getDevopsConfig(): Promise<DevopsConfigRow> {
    this.logger.verbose('read "devops" from config')
    const converter = this.databaseService.getDefaultConverter<DevopsConfigRow>()
    const snapshot = await this.collection.withConverter(converter).doc('devops').get()

    const data = snapshot.data()

    if (!data) unexpected('Could not find devops configs in the database.')

    return data
  }

  @CacheMethod(300)
  async cachedGetRatingConfig(): Promise<RatingConfigModel> {
    this.logger.verbose('read "rating" from config')
    const converter = this.databaseService.getDefaultConverter<RatingConfigModel>()
    const snapshot = await this.collection.withConverter(converter).doc('rating').get()

    const data = snapshot.data()
    if (!data) unexpected('rating-config-not-found')

    return data
  }
}
