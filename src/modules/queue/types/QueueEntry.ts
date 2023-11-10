import { GamePlayerProfile } from './GamePlayerProfile'
import { QueueSocket } from './QueueSocket'

export interface QueueEntry {
  socket: QueueSocket
  user: GamePlayerProfile
}
