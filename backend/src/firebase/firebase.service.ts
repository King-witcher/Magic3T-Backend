import { unexpected } from '@/common'
import { Injectable } from '@nestjs/common'
import { App, cert, getApps, initializeApp, ServiceAccount } from 'firebase-admin/app'
import { Auth, getAuth } from 'firebase-admin/auth'
import { Firestore, getFirestore } from 'firebase-admin/firestore'

@Injectable()
export class FirebaseService {
  public readonly firestore: Firestore
  public readonly firebaseAuth: Auth
  public readonly firebase: App

  constructor() {
    const credentials = this.getCredentials()

    this.firebase =
      getApps()[0] ||
      initializeApp({
        credential: cert(credentials),
      })

    this.firestore = getFirestore(process.env.FIRESTORE_DB)
    this.firebaseAuth = getAuth(this.firebase)
  }

  getCredentials(): ServiceAccount {
    if (!process.env.FIREBASE_ADMIN_CREDENTIALS)
      unexpected('firebase-credentials-not-found', 'Firebase Admin credentials not found on environment')

    return JSON.parse(Buffer.from(process.env.FIREBASE_ADMIN_CREDENTIALS, 'base64').toString())
  }
}
