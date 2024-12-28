import { Team } from '@/database'
import { MatchEventsEnum } from '@/match/lib/match'
import { Choice } from '@/types/Choice'
import { Perspective } from '../lib/perspective'
import { StateReportData } from '../types'

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

    perspective.observe(MatchEventsEnum.Start, callback)
    perspective.observe(MatchEventsEnum.Choice, callback)
  }

  protected abstract think(state: StateReportData, team: Team): Promise<Choice>
}
