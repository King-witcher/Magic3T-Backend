import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { QueueSocket } from '../types/QueueSocket'
import { GamePlayerProfile } from '../types/GamePlayerProfile'

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): GamePlayerProfile => {
    const client = ctx.switchToWs().getClient<QueueSocket>()
    return client.data.user
  },
)
