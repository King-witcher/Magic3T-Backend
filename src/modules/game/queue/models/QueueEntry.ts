import { Socket } from 'socket.io'
import { PlayerData } from './PlayerData'

export interface QueueEntry {
  socket: Socket
  user: PlayerData
}
