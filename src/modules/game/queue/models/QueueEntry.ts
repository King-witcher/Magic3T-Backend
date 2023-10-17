import { Socket } from 'socket.io'
import { PlayerProfile } from './PlayerProfile'

export interface QueueEntry {
  socket: Socket
  user: PlayerProfile
}
