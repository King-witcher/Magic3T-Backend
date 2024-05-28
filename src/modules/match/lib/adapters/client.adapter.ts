import { PerspectiveGameState } from '../../types/perspective.game.state'

/** Connects a PlayerHandler to an actual player that will process those state changes. */
export interface IClientAdapter {
  sendState(state: PerspectiveGameState): void
  sendMessage(message: string): void
  sendOpponentUid(uid: string): void
  sendRatingsVariation(data: { player: number; opponent: number }): void
}
