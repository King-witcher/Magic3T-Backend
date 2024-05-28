import { Inject, Injectable } from '@nestjs/common'

import { SocketsService } from '@common'
import {
  MatchSideAdapter,
  MatchSocketEmitMap,
  MatchSocketEmittedEvent,
} from '../types'
import { MatchEventsEnum } from '../lib'

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
