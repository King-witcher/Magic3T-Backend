import { ExecutionContext, createParamDecorator } from '@nestjs/common'

import { QueueSocket } from '../types'

export const Uid = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const client = ctx.switchToWs().getClient<QueueSocket>()
    return client.data.uid
  },
)
