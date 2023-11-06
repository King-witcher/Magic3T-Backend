import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { Socket } from 'socket.io'
import { Player } from '../lib/Player'
import { PlayerSocket } from '../models/PlayerSocket'

export const CurrentPlayer = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Player => {
    const client = ctx.switchToWs().getClient<PlayerSocket>()
    return client.data.player as Player
  },
)
