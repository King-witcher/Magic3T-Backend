import { WithId } from '@/firebase/models/types/WithId'
import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore'
import { Firestorify } from './types/Firestorify'
import { OptionalProp } from '@/types/OptionalProp'

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
      const output: OptionalProp<T, '_id'> = { ...data }
      delete output._id
      return output
    },
  }
}
