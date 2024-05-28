import { Inject, Injectable } from '@nestjs/common'
import { MatchEventsEnum } from '../lib/match'
import {
  MatchSocketEmitMap,
  MatchSocketEmittedEvent,
} from '../types/MatchSocket'
import { SocketsService } from '@/common/services/sockets.service'
import { MatchSideAdapter } from '../types/match-side-adapter'

@Injectable()
export class ClientSyncService {
  constructor(
    @Inject('MatchSocketsService')
    private readonly socketsService: SocketsService<MatchSocketEmitMap>,
  ) {}

  sync(adapter: MatchSideAdapter, uid: string) {
    adapter.observe(MatchEventsEnum.Choice, () => {
      this.socketsService.emit(
        uid,
        MatchSocketEmittedEvent.GameState,
        adapter.state,
      )
    })

    adapter.observe(MatchEventsEnum.Forfeit, () => {
      this.socketsService.emit(
        uid,
        MatchSocketEmittedEvent.GameState,
        adapter.state,
      )
    })

    adapter.observe(MatchEventsEnum.Timeout, () => {
      this.socketsService.emit(
        uid,
        MatchSocketEmittedEvent.GameState,
        adapter.state,
      )
    })
  }
}
