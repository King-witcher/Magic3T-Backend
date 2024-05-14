import { IMatchObserver } from '@modules/match/lib/observers/match.observer.interface'
import { PerspectiveGameState } from '@modules/match/types/perspective.game.state'
import { Choice } from '@/types/Choice'
import { IMatchAdapter } from '@modules/match/lib/adapters/matchAdapter'
import { MatchEventsEnum } from '@modules/match/lib/match.handler'

export abstract class BaseBot implements IMatchObserver {
  observe(adapter: IMatchAdapter) {
    const callback = () => {
      const state = adapter.state
      if (!state.turn) return
      const choice = this.think(state)

      // Waits for all other observers to be notified about the choice before committing a choice.
      setTimeout(() => {
        adapter.makeChoice(choice)
      })
    }

    adapter.observe(MatchEventsEnum.Start, callback)
    adapter.observe(MatchEventsEnum.Choice, callback)
  }

  protected abstract think(state: PerspectiveGameState): Choice
}
