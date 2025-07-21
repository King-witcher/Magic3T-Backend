import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common'

import { SocketsService } from '@/common'
import { MatchBank } from './lib'
import { MatchRequest } from './types/match-request'
import { MatchSocket } from './types'
import { GameServerEventsMap } from '@magic3t/types'

@Injectable()
export class MatchGuard implements CanActivate {
  private readonly logger = new Logger(MatchGuard.name, { timestamp: true })

  constructor(
    private readonly matchBank: MatchBank,
    @Inject('MatchSocketsService')
    private readonly matchSocketsService: SocketsService<GameServerEventsMap>
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
      this.logger.error(`request rejected: ${(<Error>e).message}`)
      return false
    }
  }

  private validateHttp(request: MatchRequest): boolean {
    const userId = request.userId
    if (!userId)
      throw new Error(
        'socket is not authenticated. auth guard must run before.'
      )

    const perspective = this.matchBank.getPerspective(userId)
    if (!perspective) {
      throw new Error(`user ${userId} is not currently in a match`)
    }
    request.perspective = perspective
    return true
  }

  private validateWs(socket: MatchSocket): boolean {
    const userId = socket.data.userId
    if (!userId)
      throw new Error(
        'socket is not authenticated. auth guard must run before.'
      )

    const perspective = this.matchBank.getPerspective(userId)
    if (!perspective) {
      throw new Error(`user ${userId} is not currently in a match`)
    }
    socket.data.perspective = perspective
    this.matchSocketsService.add(userId, socket)
    return true
  }
}
