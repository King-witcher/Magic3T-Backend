import { Choice } from '@/types/Choice'
import { PerspectiveGameState } from '@modules/match/types/perspective.game.state'
import { MatchEventsMap } from '@modules/match/lib/match.handler'
import { IObservable } from '@/lib/observable'

/**
 * Represents a channel through which a player can communicate with the match.
 */
export interface IMatchAdapter extends IObservable<MatchEventsMap> {
  get state(): PerspectiveGameState
  makeChoice(choice: Choice): void
  forfeit(): void
}
