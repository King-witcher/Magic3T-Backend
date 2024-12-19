import { MatchEventsEnum } from '@/match/lib/match'
import { PerspectiveGameState } from '@/match/types/perspective.game.state'
import { Choice } from '@/types/Choice'
import { Perspective } from '../types/match-side-adapter'

export abstract class BaseBot {
  observe(adapter: Perspective) {
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
