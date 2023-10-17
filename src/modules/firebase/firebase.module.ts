import { Global, Module } from '@nestjs/common'
import { FirestoreService } from './firestore.service'
import { cert, initializeApp, getApps } from 'firebase-admin/app'
import { Firestore, getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const firebase =
  getApps()[0] ||
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS!)),
  })

const firestore = getFirestore()
const auth = getAuth()

export const Firebase = Symbol('firebase')
export const FirebaseAuth = Symbol('firebase-auth')

@Global()
@Module({
  providers: [
    FirestoreService,
    {
      provide: Firebase,
      useValue: firebase,
    },
    {
      provide: Firestore,
      useValue: firestore,
    },
    {
      provide: FirebaseAuth,
      useValue: auth,
    },
  ],
  exports: [FirebaseAuth],
})
export class FirebaseModule {}
