import { ExecutionContext, createParamDecorator } from '@nestjs/common'

import { QueueSocket } from '../types'

export const HttpUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    if (ctx.getType() !== 'http') {
      throw new Error('@HttpUserId() can only be used inside a HTTP context')
    }
    const client = ctx.switchToWs().getClient<QueueSocket>()
    return client.data.uid
  },
)
