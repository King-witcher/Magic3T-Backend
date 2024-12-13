import {
  createParamDecorator,
  ExecutionContext,
  NotImplementedException,
} from '@nestjs/common'
import { AuthRequest } from './auth-request'
import { AuthSocket } from './auth-socket'

export const UserId = createParamDecorator(
  (_, ctx: ExecutionContext): string => {
    switch (ctx.getType()) {
      case 'http': {
        const request = ctx.switchToHttp().getRequest<AuthRequest>()
        return request.userId
      }

      case 'ws': {
        const client = ctx.switchToWs().getClient<AuthSocket>()
        return client.data.userId
      }

      default:
        throw new NotImplementedException()
    }
  },
)
