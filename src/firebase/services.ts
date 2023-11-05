import { initializeApp } from 'firebase-admin'
import { cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

if (!process.env.FIREBASE_ADMIN_CREDENTIALS) throw new Error('No Firebase Admin credentials')

const firebase =
  getApps()[0] ||
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)),
  })

export const firestore = getFirestore()
export const auth = getAuth()
