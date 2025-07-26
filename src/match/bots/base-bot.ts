import { MatchEventType } from '@/match/lib/match'
import { Choice, MatchState, Team } from '@magic3t/types'
import { Perspective } from '../lib/perspective'

export abstract class BaseBot {
  observe(perspective: Perspective) {
    const callback = () => {
      const state = perspective.getStateReport()
      if (state.turn !== perspective.team) return

      this.think(state, perspective.team).then((choice) => {
        // Waits for all other observers to be notified about the choice before committing a choice.
        setTimeout(() => {
          perspective.pick(choice)
        })
      })
    }

    perspective.observe(MatchEventType.Start, callback)
    perspective.observe(MatchEventType.Choice, callback)
  }

  protected abstract think(state: MatchState, team: Team): Promise<Choice>
}
