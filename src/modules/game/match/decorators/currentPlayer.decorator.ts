import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { Socket } from 'socket.io'
import { PlayerHandler } from '../models/Player'
import { PlayerSocket } from '../models/PlayerSocket'

export const CurrentPlayer = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PlayerHandler => {
    const client = ctx.switchToWs().getClient<PlayerSocket>()
    return client.data.player as PlayerHandler
  }
)
