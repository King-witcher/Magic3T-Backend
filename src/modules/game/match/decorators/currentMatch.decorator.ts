import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { Match } from '../lib/Match'
import { PlayerSocket } from '../models/PlayerSocket'

export const CurrentMatch = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Match => {
    const client = ctx.switchToWs().getClient<PlayerSocket>()
    return client.data.match
  },
)
