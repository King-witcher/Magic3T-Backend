import { Injectable, Logger } from '@nestjs/common'
import { firestore } from 'firebase-admin'
import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'

import CollectionReference = firestore.CollectionReference

import { BotConfigRow, BotName, RatingConfigRow, SingleBotConfig } from '@magic3t/database-types'
import { CacheMethod, unexpected } from '@/common'

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

  async getBotConfig(botName: BotName): Promise<SingleBotConfig | null> {
    const configs = await this.getBotConfigs()
    return configs[botName] ?? null
  }

  @CacheMethod(300)
  async cachedGetRatingConfig(): Promise<RatingConfigRow> {
    this.logger.verbose('read "rating" from config')
    const converter = this.databaseService.getDefaultConverter<RatingConfigRow>()
    const snapshot = await this.collection.withConverter(converter).doc('rating').get()

    const data = snapshot.data()
    if (!data) unexpected('rating-config-not-found')

    return data
  }
}
