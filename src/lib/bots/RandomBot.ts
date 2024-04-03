import { Player } from '@modules/match/lib/player'
import { PlayerChannel } from '@modules/match/lib/playerChannel'
import { GameState } from '@/modules/match/types/POVGameState'

export class RandomBot {
  constructor(private player: Player) {}

  private state: GameState

  getChannel(): PlayerChannel {
    const player = this.player
    return {
      sendMessage() {
        // dn
      },
      sendRatingsVariation() {
        //dn
      },
      sendOponentUid() {
        //dn
      },
      sendState(state) {
        if (state.turn) {
          const available = ([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).filter(
            (choice) =>
              !state.oponentChoices.includes(choice) &&
              !state.playerChoices.includes(choice),
          )

          if (!available.length) return

          const index = Math.trunc(Math.random() * available.length)

          player.onChoose(available[index])
          player.match.emitState()
        }
      },
    }
  }
}
