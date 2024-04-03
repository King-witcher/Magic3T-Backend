import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { Player } from '../lib/player'
import { PlayerSocket } from '../types/PlayerSocket'

export const CurrentPlayer = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Player => {
    const client = ctx.switchToWs().getClient<PlayerSocket>()
    return client.data.player as Player
  },
)
