import { Injectable } from '@nestjs/common'
import { UserRecord } from 'firebase-admin/auth'
import { FirebaseService } from '@/firebase'

@Injectable()
export class AuthService {
  constructor(private firebaseService: FirebaseService) {}

  async validateToken(token: string): Promise<string> {
    const decoded = await this.firebaseService.firebaseAuth.verifyIdToken(token)
    return decoded.uid
  }

  /**
   * Gets all user records from Firebase Auth, up to 1000.
   */
  async getAllUsers(nextPageToken?: string): Promise<[UserRecord[], string?]> {
    const firebaseAuth = this.firebaseService.firebaseAuth
    const listResult = await firebaseAuth.listUsers(1000, nextPageToken)
    return [listResult.users, listResult.pageToken]
  }
}
