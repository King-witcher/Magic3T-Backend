import { GamePlayerProfile } from '@/modules/queue/types/GamePlayerProfile'
import { GameState } from '../types/POVGameState'
import { PlayerSocket } from '../types/PlayerSocket'

export interface PlayerChannel {
  sendState(state: GameState): void
  sendMessage(message: string): void
  sendOponent(profile: GamePlayerProfile): void
}

export class SocketPlayerChannel implements PlayerChannel {
  constructor(private socket: PlayerSocket) {}

  sendState(state: GameState): void {
    this.socket.emit('gameState', JSON.stringify(state))
  }

  sendMessage(message: string) {
    this.socket.emit('message', message)
  }

  sendOponent(profile: GamePlayerProfile): void {
    this.socket.emit('oponentProfile', profile)
  }
}

export class NullPlayerChannel implements PlayerChannel {
  sendState(): void {
    // Do nothing
  }

  sendMessage(): void {
    // Do nothing
  }

  sendOponent(): void {
    // dn
  }
}
