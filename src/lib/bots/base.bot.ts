import { MatchHandler } from '@modules/match/lib/match.handler'
import { IMatchAdapter } from '@modules/match/lib/adapters/matchAdapter'

export abstract class BaseBot {
  protected matchHandlerAdapter: IMatchAdapter | null = null

  abstract observe(match: MatchHandler): void

  setMatchHandlerAdapter(adapter: IMatchAdapter) {
    this.matchHandlerAdapter = adapter
  }
}
