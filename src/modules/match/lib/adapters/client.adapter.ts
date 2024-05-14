import { SocketsService } from '@modules/sockets.service'
import { PerspectiveGameState } from '../../types/perspective.game.state'
import { MatchSocketEmitMap } from '../../types/MatchSocket'
import { Player } from '../player'

/** Connects a PlayerHandler to an actual player that will process those state changes. */
export interface IClientAdapter {
  sendState(state: PerspectiveGameState): void
  sendMessage(message: string): void
  sendOponentUid(uid: string): void
  sendRatingsVariation(data: { player: number; oponent: number }): void
}
