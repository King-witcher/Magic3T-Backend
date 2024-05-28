import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { MatchSocket } from '../types/MatchSocket'
import { MatchSideAdapter } from '../types/match-side-adapter'

export const CurrentMatchAdapter = createParamDecorator(
  (_, ctx: ExecutionContext): MatchSideAdapter => {
    const client = ctx.switchToWs().getClient<MatchSocket>()
    return client.data.matchAdapter
  },
)
