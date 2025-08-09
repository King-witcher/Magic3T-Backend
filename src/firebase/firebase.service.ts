import { Injectable } from '@nestjs/common'
import { firestore } from 'firebase-admin'
import { App, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import Firestore = firestore.Firestore
import { Auth } from 'firebase-admin/auth'
import { getAuth } from 'firebase-admin/auth'

@Injectable()
export class FirebaseService {
  public readonly firestore: Firestore
  public readonly firebaseAuth: Auth
  private readonly firebase: App

  constructor() {
    const credentials = atob(process.env.FIREBASE_ADMIN_CREDENTIALS)
    if (!credentials)
      throw new Error('Firebase Admin credentials not found on environment')

    this.firebase =
      getApps()[0] ||
      initializeApp({
        credential: cert(JSON.parse(credentials)),
      })

    this.firestore = getFirestore(process.env.FIRESTORE_DB)
    this.firebaseAuth = getAuth(this.firebase)
  }
}
