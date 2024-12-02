import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common'

import { SocketsService } from '@/common'
import { MatchSocket, MatchSocketEmitMap } from './types'
import { MatchBank } from './lib'
import { MatchRequest } from './types/match-request'

@Injectable()
export class MatchGuard implements CanActivate {
  private readonly logger = new Logger(MatchGuard.name, { timestamp: true })

  constructor(
    private readonly matchBank: MatchBank,
    @Inject('MatchSocketsService')
    private readonly matchSocketsService: SocketsService<MatchSocketEmitMap>,
  ) {}

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
          throw new NotImplementedException()
      }
    } catch (e) {
      this.logger.error(`request rejected: ${e.message}`)
      return false
    }
  }

  private validateHttp(request: MatchRequest): boolean {
    const userId = request.userId
    if (!userId)
      throw new Error(
        'socket is not authenticated. auth guard must run before.',
      )

    const matchAdapter = this.matchBank.getAdapter(userId)
    if (!matchAdapter) {
      throw new Error(`user ${userId} is not currently in a match`)
    }
    return true
  }

  private validateWs(socket: MatchSocket): boolean {
    const userId = socket.data.userId
    if (!userId)
      throw new Error(
        'socket is not authenticated. auth guard must run before.',
      )

    const matchAdapter = this.matchBank.getAdapter(userId)
    if (!matchAdapter) {
      throw new Error(`user ${userId} is not currently in a match`)
    }
    this.matchSocketsService.add(userId, socket)
    return true
  }
}
