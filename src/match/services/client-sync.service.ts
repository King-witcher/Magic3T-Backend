import { Inject, Injectable } from '@nestjs/common'

import { SocketsService } from '@common'
import { MatchEventsEnum } from '../lib'
import {
  MatchSocketEmitMap,
  MatchSocketEmittedEvent,
  Perspective,
} from '../types'

@Injectable()
export class ClientSyncService {
  constructor(
    @Inject('MatchSocketsService')
    private readonly socketsService: SocketsService<MatchSocketEmitMap>
  ) {}

  sync(perspective: Perspective, uid: string) {
    perspective.observe(MatchEventsEnum.Choice, () => {
      this.socketsService.emit(
        uid,
        MatchSocketEmittedEvent.GameState,
        perspective.state
      )
    })

    perspective.observe(MatchEventsEnum.Forfeit, () => {
      this.socketsService.emit(
        uid,
        MatchSocketEmittedEvent.GameState,
        perspective.state
      )
    })

    perspective.observe(MatchEventsEnum.Timeout, () => {
      this.socketsService.emit(
        uid,
        MatchSocketEmittedEvent.GameState,
        perspective.state
      )
    })
  }
}
