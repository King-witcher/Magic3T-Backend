import { Injectable } from '@nestjs/common'
import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore'
import { OptionalProp } from '@/types/OptionalProp'
import { Mutable } from '@/types/mutable'
import { Firestorify, WithId } from './types'

const epoch = new Date(2000, 7, 31).getTime()

// This sequence is inverted to make Firestore automatically sort matches by the latest.
const chars =
  'zyxwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA9876543210'.split('')

function convertToBase62(number: number) {
  let result = ''
  while (number) {
    result = chars[number % chars.length] + result
    number = Math.floor(number / chars.length)
  }
  return result
}

@Injectable()
export class DatabaseService {
  private readonly nonceArray: string[]
  private nonce = 0

  constructor() {
    this.nonceArray = [...chars]

    let i = this.nonceArray.length - 1
    while (i--) {
      const rand = Math.floor(Math.random() * i)

      const temp = this.nonceArray[i]
      this.nonceArray[i] = this.nonceArray[rand]
      this.nonceArray[rand] = temp
    }
  }

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

  /**
   * Gets a 6+ char time sortable unique id.
   */
  getId() {
    const lannaDate = Math.floor((Date.now() - epoch) / 1000)
    return (
      convertToBase62(lannaDate) +
      this.nonceArray[this.nonce++ % this.nonceArray.length]
    )
  }
}
