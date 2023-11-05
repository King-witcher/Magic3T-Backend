import { DocumentData } from 'firebase-admin/firestore'

export interface WithId extends DocumentData {
  _id: string
}
