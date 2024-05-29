import { PerspectiveGameState } from '../types'

/** @deprecated Connects a PlayerHandler to an actual player that will process those state changes. */
export interface IClientAdapter {
  sendState(state: PerspectiveGameState): void
  sendMessage(message: string): void
  sendOpponentUid(uid: string): void
  sendRatingsVariation(data: { player: number; opponent: number }): void
}
