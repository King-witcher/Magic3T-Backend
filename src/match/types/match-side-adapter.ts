import { IObservable } from '@/lib/observable'
import { MatchEventsMap } from '@/match/lib/match'
import { PerspectiveGameState } from '@/match/types/perspective.game.state'
import { Choice } from '@/types/Choice'

/**
 * Represents the operations a player can make from it's own perspective.
 */
export interface Perspective extends IObservable<MatchEventsMap> {
  get state(): PerspectiveGameState
  get matchId(): string
  makeChoice(choice: Choice): void
  forfeit(): void
}
