import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { QueueSocket } from '../models/QueueSocket'
import { PlayerProfile } from '../models/PlayerProfile'

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PlayerProfile => {
    const client = ctx.switchToWs().getClient<QueueSocket>()
    return client.data.user
  }
)
