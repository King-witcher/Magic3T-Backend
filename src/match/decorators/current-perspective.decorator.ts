import {
  ExecutionContext,
  NotImplementedException,
  createParamDecorator,
} from '@nestjs/common'
import { Perspective } from '../lib'
import { MatchSocket } from '../types'
import { MatchRequest } from '../types/match-request'

export const CurrentPerspective = createParamDecorator(
  (_, ctx: ExecutionContext): Perspective => {
    switch (ctx.getType()) {
      case 'http': {
        const request = ctx.switchToHttp().getRequest<MatchRequest>()
        return request.perspective
      }
      case 'ws': {
        const client = ctx.switchToWs().getClient<MatchSocket>()
        return client.data.perspective
      }
      case 'rpc':
        throw new NotImplementedException()
    }
  }
)
