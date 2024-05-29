import { Choice } from '@/types/Choice'
import { PerspectiveGameState } from '@/match/types/perspective.game.state'
import { MatchEventsMap } from '@/match/lib/match'
import { IObservable } from '@/lib/observable'

/**
 * Represents a channel through which a player can communicate with the match.
 */
export interface MatchSideAdapter extends IObservable<MatchEventsMap> {
  get state(): PerspectiveGameState
  makeChoice(choice: Choice): void
  forfeit(): void
}
