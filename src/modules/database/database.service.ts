import { Injectable } from '@nestjs/common'
import { WithId } from '@modules/database/types/withId'
import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore'
import { Firestorify } from '@modules/database/types/firestorify'
import { OptionalProp } from '@/types/OptionalProp'
import { Mutable } from '@/types/mutable'

@Injectable()
export class DatabaseService {
  private readonly ID_CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  // TODO: Remove extends WithId in later refactor
  getConverter<T extends WithId>(): FirestoreDataConverter<T> {
    function convert(data: Record<string, any>) {
      for (const [key, value] of Object.entries(data)) {
        if (value instanceof Timestamp) {
          data[key] = value.toDate()
        } else if (value instanceof Object) {
          convert(data[key])
        }
      }
    }

    return {
      fromFirestore(snap: QueryDocumentSnapshot<T>) {
        const data = snap.data()
        convert(data)
        return {
          ...data,
          _id: snap.id,
        }
      },

      toFirestore: (data: T): Firestorify<T> => {
        const output: Mutable<OptionalProp<T, '_id'>> = { ...data }
        delete output._id
        return output
      },
    }
  }

  getId(size = 28) {
    let result = ''
    for (let i = 0; i < size; i++) {
      result += this.ID_CHARS.charAt(
        Math.floor(Math.random() * this.ID_CHARS.length),
      )
    }
    return result
  }
}
