import { IClientAdapter } from '@modules/match/lib/adapters/client.adapter'
import { PerspectiveGameState } from '@modules/match/types/perspective.game.state'
import { BaseBot } from '@/lib/bots/base.bot'
import { MatchEventsEnum, MatchHandler } from '@modules/match/lib/match.handler'

export class RandomBot extends BaseBot {
  private state: PerspectiveGameState
  private match: MatchHandler

  constructor() {
    super()
  }

  observe(match: MatchHandler) {
    this.match = match
    match.observe(MatchEventsEnum.Choice, () => {})
  }

  handleStateChange(state: PerspectiveGameState) {}

  getClientAdapter(): IClientAdapter {
    const self = this
    return {
      sendMessage() {
        // dn
      },
      sendRatingsVariation() {
        //dn
      },
      sendOpponentUid() {
        //dn
      },
      sendState(state) {
        if (!self.matchHandlerAdapter)
          throw new Error('Match adapter not found')
        if (state.turn) {
          const available = ([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).filter(
            (choice) =>
              !state.oponentChoices.includes(choice) &&
              !state.playerChoices.includes(choice),
          )

          if (!available.length) return

          const index = Math.trunc(Math.random() * available.length)

          self.matchHandlerAdapter.makeChoice(available[index])
        }
      },
    }
  }
}
