import {
  ExecutionContext,
  NotImplementedException,
  createParamDecorator,
} from '@nestjs/common'
import { MatchSideAdapter, MatchSocket } from '../types'
import { MatchRequest } from '../types/match-request'

export const CurrentMatchAdapter = createParamDecorator(
  (_, ctx: ExecutionContext): MatchSideAdapter => {
    switch (ctx.getType()) {
      case 'http': {
        const request = ctx.switchToHttp().getRequest<MatchRequest>()
        return request.matchAdapter
      }
      case 'ws': {
        const client = ctx.switchToWs().getClient<MatchSocket>()
        return client.data.matchAdapter
      }
      case 'rpc':
        throw new NotImplementedException()
    }
  },
)
