import { WithId } from '@modules/database/types/withId'
import { firestore } from 'firebase-admin'
import FirestoreDataConverter = firestore.FirestoreDataConverter
import CollectionReference = firestore.CollectionReference
import Firestore = firestore.Firestore
import { DatabaseService } from '@modules/database/database.service'
import { UpdateData } from 'firebase-admin/firestore'

export abstract class ModelService<T extends WithId> {
  private readonly converter: FirestoreDataConverter<T>
  private readonly collection: CollectionReference<T>

  protected constructor(
    firestore: Firestore,
    private readonly databaseService: DatabaseService,
    private readonly collectionName: string,
  ) {
    this.converter = databaseService.getConverter<T>()
    this.collection = firestore
      .collection(collectionName)
      .withConverter(this.converter)
  }

  async get(id: string) {
    console.info(
      `%cFirestore: Read "${id}" from ${this.collection.id}.`,
      'color: #FFCA28',
    )

    const snapshot = await this.collection.doc(id).get()
    return snapshot.data() || null
  }

  /**
   * Save the document in Firestore in the corresponding _id field.
   * @param doc Document to be saved. _id field is considered to identify the document to be saved.
   */
  async save(doc: T) {
    console.info(
      `%cFirestore: Update "${doc._id}" on ${this.collection.id}.`,
      'color: #FFCA28',
    )

    await this.collection.doc(doc._id).set(doc)
  }

  /**
   * Generate a new id and store the doc in Firestore, ignoring _id field. Returns the id set in Firestore.
   * @param doc Document to be created. _id field is ignored.
   */
  async create(doc: T) {
    const id = this.databaseService.getId()

    console.info(
      `%cFirestore: Create "${id}" on ${this.collection.id}.`,
      'color: #FFCA28',
    )

    await this.collection.doc(id).set(doc)
    return id
  }

  /**
   * Update a document in Firestore.
   * @param doc Document to be updated. _id field is considered to identify the document to be updated.
   */
  async update(doc: UpdateData<T> & WithId) {
    console.info(
      `%cFirestore: Update "${doc._id}" on ${this.collection.id}.`,
      'color: #FFCA28',
    )
    await this.collection.doc(doc._id).update(doc)
  }
}
