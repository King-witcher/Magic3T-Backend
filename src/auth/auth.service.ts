import { FirebaseService } from '@/firebase'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async validateToken(token: string): Promise<string> {
    const decoded = await this.firebaseService.firebaseAuth.verifyIdToken(token)
    return decoded.uid
  }
}
