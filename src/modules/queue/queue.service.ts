import { Injectable, NotImplementedException } from '@nestjs/common'
import { SessionService } from '../session/session.service'
import { ProfileService } from '../profile/profile.service'
import { QueueEntry, QueueStatus } from './queue.types'
import { GameService } from '../game/game.service'
import Queue from './queue'

export enum QueueMode {
  Casual, Ranked
}

@Injectable()
export class QueueService {
  private casualQueue: Queue
  private rankedQueue: Queue

  constructor(
    profileService: ProfileService,
    sessionService: SessionService,
    gameService: GameService,
  ) {
    this.casualQueue = new Queue(false, sessionService, gameService)
    this.casualQueue.init()
  }

  async insertToQueue(sessionId: string | null, mode: QueueMode): Promise<string> {
    if (mode===QueueMode.Casual) {
      return await this.casualQueue.insert(sessionId)
    } else throw new NotImplementedException()
  }

  removeFromQueue(queueId: string, gameMode: QueueMode) {
    if (gameMode===QueueMode.Casual) {
      return this.casualQueue.remove(queueId)
    } else throw new NotImplementedException()
  }

  getEntryStatus(queueId: string, mode: QueueMode): QueueEntry | null {
    if (mode===QueueMode.Casual) {
      return this.casualQueue.getEntryStatus(queueId)
    } else throw new NotImplementedException()
  }
}
