import { Glicko } from '@/firebase/models/users/User'

export interface PlayerProfile {
  uid: string
  name: string
  glicko: Glicko
  isAnonymous?: boolean
}
