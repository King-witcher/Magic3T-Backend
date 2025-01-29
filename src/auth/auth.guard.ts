import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common'
import { AuthRequest } from './auth-request'
import { AuthSocket } from './auth-socket'
import { AuthService } from './auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name, { timestamp: true })

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    try {
      switch (context.getType()) {
        case 'http': {
          const request = context.switchToHttp().getRequest<AuthRequest>()
          return await this.validateHttp(request)
        }
        case 'ws': {
          const socket = context.switchToWs().getClient<AuthSocket>()
          return await this.validateWs(socket)
        }
        default: {
          throw new NotImplementedException()
        }
      }
    } catch (e) {
      this.logger.error(`request rejected: ${(<Error>e).message}`)
      return false
    }
  }

  private async validateHttp(request: AuthRequest): Promise<boolean> {
    const token = request.headers.authorization as string | undefined
    if (!token) throw new Error('"Authorization" header is missing')
    const userId = await this.authService.validateToken(
      token.replace('Bearer ', '')
    )
    request.userId = userId
    return true
  }

  private async validateWs(socket: AuthSocket): Promise<boolean> {
    const token = socket.handshake.auth.token as string | undefined
    if (!token) throw new Error('auth token is missing')

    // Socket has already been validated.
    if (socket.data.userId) return true
    const userId = await this.authService.validateToken(
      token.replace('Bearer ', '')
    )
    socket.data.userId = userId

    this.logger.log(`ws connection from user ${userId} accepted`)
    return true
  }
}
