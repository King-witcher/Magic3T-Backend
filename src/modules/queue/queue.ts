import { NotImplementedException } from '@nestjs/common'
import { SessionService } from '../session/session.service'
import { QueueEntry, QueueStatus } from './queue.types'
import { v4 } from 'uuid'
import { GameService } from '../game/game.service'

const ITERATE_TIME = parseInt(process.env.QUEUE_ITERATE_TIME || '1000')
const MAX_AFK_TIME = parseInt(process.env.QUEUE_MAX_AFK_TIME || '1000') // Tempo máximo que um jogador pode ficar sem checar a fila para que seja retirado.
const AFTER_MATCH_TIME = parseInt(process.env.QUEUE_MATCH_TIME || '10000') // Tempo que os jogadores têm para enviar mensagens depois de um match.

export default class Queue {
  private entries: { [queueId: string]: QueueEntry } = {}
  private iterateInterval: NodeJS.Timer

  constructor(
    private isRatingPaired: boolean,
    private sessionService: SessionService,
    private gameService: GameService
  ) {}

  init() {
    this.iterateInterval = setInterval(this.iterate.bind(this), ITERATE_TIME)
  }

  async insert(sessionId: string | null): Promise<string> {
    if (!sessionId) {
      if (this.isRatingPaired)
        throw new Error(
          'sessionId nulo passado para uma fila que não aceita nulos.'
        )

      const queueId = v4()

      const queueEntry: QueueEntry = {
        profile: null,
        lastQueueCheck: Date.now(),
        queueTime: Date.now(),
        queueStatus: QueueStatus.Searching,
        matchTime: null,
        playerId: null,
      }

      this.entries[queueId] = queueEntry
      return queueId
    } else throw new NotImplementedException()
  }

  remove(queueId: string) {
    delete this.entries[queueId]
  }

  getEntryStatus(queueId: string) {
    const queueEntry = this.entries[queueId]
    if (queueEntry) {
      queueEntry.lastQueueCheck = Date.now()
      if (queueEntry.queueStatus === QueueStatus.Matched)
        delete this.entries[queueId]
      return queueEntry
    } else return null
  }

  private iterate() {
    console.log(this.entries)
    let oddEntry: [string, QueueEntry] | null = null
    for (const [key, value] of Object.entries(this.entries)) {
      if (value.queueStatus === QueueStatus.Searching) {
        // Remove entradas que não checaram status há um tempo.
        if (Date.now() - value.lastQueueCheck >= MAX_AFK_TIME) {
          console.log('deleting:', Date.now() - value.lastQueueCheck)
          //delete this.entries[key]
          continue
        }

        // Pareia duas entradas.
        if (oddEntry) {
          this.match(oddEntry[0], key)
          oddEntry = null
        } else {
          oddEntry = [key, value]
        }
      }
    }
  }

  private match(queueId1: string, queueId2: string) {
    const entry1 = this.entries[queueId1]
    const entry2 = this.entries[queueId2]

    if (entry1.profile || entry2.profile) throw new NotImplementedException()

    const id1: [string] = ['']
    const id2: [string] = ['']

    this.gameService.createGame({
      player1: {
        nickname: null,
        rating: null,
        out_id: id1,
      },
      player2: {
        nickname: null,
        rating: null,
        out_id: id2,
      },
    })

    entry1.queueStatus = QueueStatus.Matched
    entry1.matchTime = Date.now()
    entry1.playerId = id1[0]

    entry2.queueStatus = QueueStatus.Matched
    entry2.matchTime = Date.now()
    entry2.playerId = id2[0]
  }
}
