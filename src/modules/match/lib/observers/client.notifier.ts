import { IMatchObserver } from '@modules/match/lib/observers/match.observer.interface'
import { MatchEventsEnum } from '@modules/match/lib/match.handler'
import { SocketsService } from '@modules/sockets.service'
import { MatchSocketEmitMap } from '@modules/match/types/MatchSocket'
import { IMatchAdapter } from '@modules/match/lib/adapters/matchAdapter'

export class ClientNotifier implements IMatchObserver {
  constructor(
    private uid: string,
    private socketsService: SocketsService<MatchSocketEmitMap>,
  ) {}

  observe(match: IMatchAdapter) {
    match.observe(MatchEventsEnum.Choice, () => {
      this.socketsService.emit(
        this.uid,
        'gameState',
        JSON.stringify(match.state),
      )
    })

    match.observe(MatchEventsEnum.Forfeit, () => {
      this.socketsService.emit(
        this.uid,
        'gameState',
        JSON.stringify(match.state),
      )
    })

    match.observe(MatchEventsEnum.Timeout, () => {
      this.socketsService.emit(
        this.uid,
        'gameState',
        JSON.stringify(match.state),
      )
    })
  }
}
