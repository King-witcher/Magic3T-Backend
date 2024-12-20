import { delay } from '@/lib/utils'
import { BaseBot } from '@/match/bots/base-bot'
import { PerspectiveGameState } from '@/match/types/perspective.game.state'

export class RandomBot extends BaseBot {
  async think(state: PerspectiveGameState) {
    const available = ([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).filter(
      (choice) =>
        !state.opponentChoices.includes(choice) &&
        !state.playerChoices.includes(choice)
    )

    await delay(Math.random() * 2000 + 3000) // Waits from 3 to 5 seconds before deciding

    if (!available.length) throw new Error('No available choices.')

    const index = Math.trunc(Math.random() * available.length)

    return available[index]
  }
}
