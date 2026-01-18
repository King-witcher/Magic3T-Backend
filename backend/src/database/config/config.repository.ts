import { Injectable, Logger } from '@nestjs/common'
import { firestore } from 'firebase-admin'
import { DatabaseService } from '@/database/database.service'
import { FirebaseService } from '@/firebase/firebase.service'

import CollectionReference = firestore.CollectionReference

import { CacheMethod, Result } from '@common'
import {
  BotConfig,
  BotConfigRow,
  BotName,
  DevopsConfigModel,
  RatingConfigModel,
} from '@magic3t/types'

export type ConfigRepositoryError = 'configs-not-found' | 'bot-not-found'
type ConfigRepositoryResult<T> = Result<T, ConfigRepositoryError>

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
  async getBotConfigs(): Promise<ConfigRepositoryResult<BotConfigRow>> {
    this.logger.verbose('read "bots" from config')

    const converter = this.databaseService.getDefaultConverter<BotConfigRow>()
    const snapshot = await this.collection.withConverter(converter).doc('bots').get()

    const data = snapshot.data()

    if (!data) return Err('configs-not-found')

    return Ok(data)
  }

  async getBotConfig(botName: BotName): Promise<BotConfig | null> {
    const result = await this.getBotConfigs()

    return result.match({
      ok: (configs) => {
        const config = configs[botName]
        if (!config) return null
        return config
      },
      err: () => null,
    })
  }

  @CacheMethod(10)
  async getDevopsConfig(): Promise<ConfigRepositoryResult<DevopsConfigModel>> {
    this.logger.verbose('read "devops" from config')
    const converter = this.databaseService.getDefaultConverter<DevopsConfigModel>()
    const snapshot = await this.collection.withConverter(converter).doc('devops').get()

    const data = snapshot.data()

    if (!data) return Err('configs-not-found')

    return Ok(data)
  }

  @CacheMethod(300)
  async cachedGetRatingConfig(): Promise<ConfigRepositoryResult<RatingConfigModel>> {
    this.logger.verbose('read "rating" from config')
    const converter = this.databaseService.getDefaultConverter<RatingConfigModel>()
    const snapshot = await this.collection.withConverter(converter).doc('rating').get()

    const data = snapshot.data()

    if (!data) return Err('configs-not-found')

    return Ok(data)
  }
}
