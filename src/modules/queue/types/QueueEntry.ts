import { Socket } from 'socket.io'
import { GamePlayerProfile } from './GamePlayerProfile'

export interface QueueEntry {
  socket: Socket
  user: GamePlayerProfile
}
