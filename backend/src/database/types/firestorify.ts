import { DocumentData, Timestamp } from 'firebase-admin/firestore'
import { ModifyProp } from '@/types/ModifyProp'

export type Firestorify<T extends DocumentData> = ModifyProp<T, Date, Timestamp>
