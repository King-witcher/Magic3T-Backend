import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { respondError } from '@/common'
import { AuthenticRequest } from './auth-request'
import { AuthenticSocket } from './auth-socket'

export const UserId = createParamDecorator((_, ctx: ExecutionContext): string => {
  switch (ctx.getType()) {
    case 'http': {
      const request = ctx.switchToHttp().getRequest<AuthenticRequest>()
      return request.userId
    }

    case 'ws': {
      const client = ctx.switchToWs().getClient<AuthenticSocket>()
      return client.data.userId
    }

    default:
      respondError(
        'not-implemented',
        501,
        'UserId decorator is not implemented for this context type.'
      )
  }
})
