import { SocketsService } from '@/modules/sockets.service'
import { GameState } from '../types/POVGameState'
import { PlayerEmitType } from '../types/PlayerSocket'
import { Player } from './Player'

export interface PlayerChannel {
  sendState(state: GameState): void
  sendMessage(message: string): void
  sendOponentUid(uid: string): void
  sendRatingsVariation(data: { player: number; oponent: number }): void
}

export class SocketPlayerChannel implements PlayerChannel {
  constructor(
    private player: Player,
    private socketsService: SocketsService<PlayerEmitType>,
  ) {}
  sendRatingsVariation(data: { player: number; oponent: number }): void {
    this.socketsService.emit(this.player.profile.uid, 'ratingsVariation', data)
  }

  sendState(state: GameState): void {
    this.socketsService.emit(
      this.player.profile.uid,
      'gameState',
      JSON.stringify(state),
    )
  }

  sendMessage(message: string) {
    this.socketsService.emit(this.player.profile.uid, 'message', message)
  }

  sendOponentUid(uid: string): void {
    this.socketsService.emit(this.player.profile.uid, 'oponentUid', uid)
  }
}

export class NullPlayerChannel implements PlayerChannel {
  sendRatingsVariation(): void {
    throw new Error('Method not implemented.')
  }
  sendState(): void {
    // Do nothing
  }

  sendMessage(): void {
    // Do nothing
  }

  sendOponentUid(): void {
    // dn
  }
}
