import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: 'magic3t-backend.firebaseapp.com',
  projectId: 'magic3t-backend',
  storageBucket: 'magic3t-backend.appspot.com',
  messagingSenderId: '216673023122',
  appId: '1:216673023122:web:f59977a0b179b00c8d624b',
  measurementId: 'G-G91SWDHN6Q'
}

export const app = initializeApp(firebaseConfig)
export const firestore = getFirestore(app)