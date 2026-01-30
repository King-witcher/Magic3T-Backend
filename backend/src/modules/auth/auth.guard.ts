import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Socket } from 'socket.io'
import { respondError } from '@/common'
import { AuthService } from './auth.service'
import { AuthenticRequest } from './auth-request'
import { SKIP_AUTH_KEY } from './skip-auth.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name, { timestamp: true })

  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext) {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (skipAuth) return true

    try {
      switch (context.getType()) {
        case 'http': {
          const request = context.switchToHttp().getRequest<AuthenticRequest>()
          return await this.validateHttp(request)
        }
        case 'ws': {
          const socket = context.switchToWs().getClient<Socket>()
          return await this.validateWs(socket)
        }
        default: {
          respondError('not-implemented', 501, 'AuthGuard not implemented for this context')
        }
      }
    } catch (e) {
      this.logger.error(`request rejected: ${(<Error>e).message}`)
      return false
    }
  }

  private async validateHttp(request: AuthenticRequest): Promise<boolean> {
    const token = request.headers.authorization as string | undefined
    if (!token) respondError('unauthorized', 401, '"Authorization" header is missing')
    const userId = await this.authService.validateToken(token.replace('Bearer ', ''))
    if (!userId) respondError('unauthorized', 401, 'Invalid auth token')
    request.userId = userId
    return true
  }

  private async validateWs(socket: Socket): Promise<boolean> {
    // Socket authentication is done during connection in the Gateway.

    if (!('data' in socket) || !socket.data.userId) {
      this.logger.warn(`unauthenticated socket connection attempt refused`)
      return false
    }

    return true
  }
}
