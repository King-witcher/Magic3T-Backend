import { firestore } from 'firebase-admin'
import FirestoreDataConverter = firestore.FirestoreDataConverter
import CollectionReference = firestore.CollectionReference
import Firestore = firestore.Firestore
import { DatabaseService } from '@/database/database.service'
import { WithId } from '@magic3t/types'
import { Logger } from '@nestjs/common'
import { UpdateData } from 'firebase-admin/firestore'

export abstract class BaseRepository<T extends WithId> {
  protected readonly logger = new Logger(BaseRepository.name, {
    timestamp: true,
  })
  protected readonly converter: FirestoreDataConverter<T>
  protected readonly collection: CollectionReference<T>

  protected constructor(
    protected firestore: Firestore,
    private databaseService: DatabaseService,
    protected collectionName: string
  ) {
    this.converter = databaseService.getConverter<T>()
    this.collection = firestore
      .collection(collectionName)
      .withConverter(this.converter)
  }

  async get(id: string): Promise<T | null> {
    this.logger.verbose(`read "${id}" from ${this.collection.id}.`)

    const snapshot = await this.collection.doc(id).get()
    return snapshot.data() || null
  }

  async getAll(): Promise<T[]> {
    const snapshot = await this.collection.get()
    this.logger.verbose(`read all ${snapshot.size} from ${this.collection.id}.`)
    return snapshot.docs.map((doc) => doc.data())
  }

  /**
   * Save the document in Firestore in the corresponding _id field.
   * @param doc Document to be saved. _id field is considered to identify the document to be saved.
   */
  async save(doc: T) {
    this.logger.verbose(`update "${doc._id}" on ${this.collection.id}.`)

    await this.collection.doc(doc._id).set(doc)
  }

  /**
   * Generate a new id and store the doc in Firestore, ignoring _id field. Returns the id set in Firestore.
   * @param doc Document to be created. _id field is ignored.
   */
  async create(doc: T): Promise<string> {
    const id = doc._id ?? this.databaseService.getTemporalId()

    this.logger.verbose(`create "${id}" on ${this.collection.id}.`)

    await this.collection.doc(id).set(doc)
    return id
  }

  /**
   * Update a document in Firestore.
   * @param doc Document to be updated. _id field is considered to identify the document to be updated.
   */
  async update(doc: UpdateData<T> & WithId) {
    const clone: UpdateData<T> = { ...doc }
    const id = clone._id
    delete clone._id
    this.logger.verbose(`update "${id}" on ${this.collection.id}.`)
    await this.collection.doc(doc._id).update(clone)
  }
}
