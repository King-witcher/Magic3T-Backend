import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common'

import { FirebaseService } from '@/firebase'
import { Request } from 'express'

@Injectable()
export class HttpQueueGuard implements CanActivate {
  private readonly logger = new Logger(HttpQueueGuard.name, { timestamp: true })

  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest<Request>()
      const token = request.headers.authorization
      if (!token) throw new Error('"Authorization" header is missing')
      await this.firebaseService.firebaseAuth.verifyIdToken(token)
      return true
    } catch (e) {
      this.logger.error(`request rejected: ${e.message}`)
      return false
    }
  }
}
