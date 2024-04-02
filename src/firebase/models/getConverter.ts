import { WithId } from '@modules/database/types/withId'
import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore'
import { Firestorify } from '@modules/database/types/firestorify'
import { OptionalProp } from '@/types/OptionalProp'
import { Mutable } from '@/types/mutable'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convert(data: Record<string, any>) {
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      data[key] = value.toDate()
    } else if (value instanceof Object) {
      convert(data[key])
    }
  }
}

export function getConverter<T extends WithId>(): FirestoreDataConverter<T> {
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
