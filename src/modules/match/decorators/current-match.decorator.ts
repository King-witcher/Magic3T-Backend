import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { MatchSocket } from '../types/MatchSocket'
import { IMatchAdapter } from '@modules/match/lib/adapters/matchAdapter'

export const CurrentMatchAdapter = createParamDecorator(
  (_, ctx: ExecutionContext): IMatchAdapter => {
    const client = ctx.switchToWs().getClient<MatchSocket>()
    return client.data.matchAdapter
  },
)
