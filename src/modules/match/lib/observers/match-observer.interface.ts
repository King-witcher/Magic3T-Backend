import { IMatchAdapter } from '@modules/match/lib/adapters/matchAdapter'

export interface IMatchObserver {
  observe(match: IMatchAdapter): void
}
