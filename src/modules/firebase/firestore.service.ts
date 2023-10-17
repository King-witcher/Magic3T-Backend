import { Injectable } from '@nestjs/common'
import { Firestore } from 'firebase-admin/firestore'

@Injectable()
export class FirestoreService {
  constructor(private firestore: Firestore) {}
}
