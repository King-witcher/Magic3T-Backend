import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { respondError, unexpected } from '@/common'
import { MatchBank } from './lib'
import { MatchSocket } from './types'
import { MatchRequest } from './types/match-request'

@Injectable()
export class MatchGuard implements CanActivate {
  private readonly logger = new Logger(MatchGuard.name, { timestamp: true })

  constructor(private readonly matchBank: MatchBank) {}

  canActivate(context: ExecutionContext) {
    try {
      switch (context.getType()) {
        case 'http': {
          const request = context.switchToHttp().getRequest<MatchRequest>()
          return this.validateHttp(request)
        }
        case 'ws': {
          const client = context.switchToWs().getClient<MatchSocket>()
          return this.validateWs(client)
        }
        case 'rpc':
          respondError('not-supported', 400)
      }
    } catch (e) {
      this.logger.error(`request rejected: ${(<Error>e).message}`)
      return false
    }
  }

  private validateHttp(request: MatchRequest): boolean {
    const userId = request.userId
    if (!userId) throw new Error('http client is not authenticated. auth guard must run before.')

    const perspective = this.matchBank.getPerspective(userId)
    if (!perspective) respondError('not-in-match', 400)

    request.perspective = perspective
    return true
  }

  private validateWs(socket: MatchSocket): boolean {
    const userId = socket.data.userId
    if (!userId) unexpected('unauthenticated socket connection.')

    const perspective = this.matchBank.getPerspective(userId)
    if (!perspective) respondError('not-in-match', 400)

    socket.data.perspective = perspective
    return true
  }
}
