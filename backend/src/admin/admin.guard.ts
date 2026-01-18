import { CanActivate, ExecutionContext, Injectable, NotImplementedException } from '@nestjs/common'
import { AuthRequest } from '@/auth/auth-request'
import { AuthSocket } from '@/auth/auth-socket'
import { UserRepository } from '@/database'

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userRepository: UserRepository) {}

  async canActivate(context: ExecutionContext) {
    let userId: string | undefined

    switch (context.getType()) {
      case 'http': {
        const request = context.switchToHttp().getRequest<AuthRequest>()
        userId = request.userId
        break
      }
      case 'ws': {
        const socket = context.switchToWs().getClient<AuthSocket>()
        userId = socket.data.userId
        break
      }
      default: {
        throw new NotImplementedException()
      }
    }

    if (!userId) return false
    const user = await this.userRepository.getById(userId)
    if (!user) return false
    if (user.data.role === 'creator') return true
    return false
  }
}
