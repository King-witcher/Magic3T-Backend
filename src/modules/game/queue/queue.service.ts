import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { MatchService } from '../match/match.service'

@Injectable()
export class QueueService {
  constructor(private readonly matchService: MatchService) {}

  enqueued: string | null

  enqueue(id: string) {
    if (this.enqueued !== null) {
    } else {
      this.enqueued = id
    }
  }

  private createMatch() {}

  dequeue(id: string) {}
}
