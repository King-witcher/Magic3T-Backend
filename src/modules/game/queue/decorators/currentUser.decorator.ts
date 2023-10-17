import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { QueueSocket } from '../models/QueueSocket'
import { PlayerData } from '../models/PlayerData'

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PlayerData => {
    const client = ctx.switchToWs().getClient<QueueSocket>()
    return client.data.user
  }
)
