import { ExecutionContext, createParamDecorator } from '@nestjs/common'

import { QueueSocket } from '../types'

export const WsUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    if (ctx.getType() !== 'ws') {
      throw new Error('@WsUserId() can only be used inside a WebSocket context')
    }
    const client = ctx.switchToWs().getClient<QueueSocket>()
    return client.data.uid
  },
)
