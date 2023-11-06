import { Glicko } from '@/firebase/models/users/User'

export interface GamePlayerProfile {
  uid: string
  name: string
  glicko: Glicko
  isAnonymous?: boolean
}
