import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { MatchSideAdapter, MatchSocket } from '../types'

export const CurrentMatchAdapter = createParamDecorator(
  (_, ctx: ExecutionContext): MatchSideAdapter => {
    const client = ctx.switchToWs().getClient<MatchSocket>()
    return client.data.matchAdapter
  },
)
