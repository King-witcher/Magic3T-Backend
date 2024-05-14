import { Injectable } from '@nestjs/common'
import { FirebaseService } from '@modules/firebase/firebase.service'
import { DatabaseService } from '@modules/database/database.service'
import { BotConfigModel } from '@modules/database/config/bot-config.model'
import { firestore } from 'firebase-admin'
import CollectionReference = firestore.CollectionReference

@Injectable()
export class ConfigService {
  private collection: CollectionReference

  constructor(
    private firestoreSerivce: FirebaseService,
    private databaseService: DatabaseService,
  ) {
    this.collection = firestoreSerivce.firestore.collection('config')
  }

  async botConfigs() {
    // TODO: Cache this info for a while.
    const converter = this.databaseService.getConverter<BotConfigModel>()
    const snapshot = await this.collection
      .withConverter(converter)
      .doc('bots')
      .get()

    return snapshot.data() as BotConfigModel
  }
}
