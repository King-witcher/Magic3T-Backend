import { UsersService } from './../../../database/users/users.service'
import {
  HistoryMatchEventsEnum,
  HistoryMatchEvent,
  MatchModel,
  GameMode,
} from '@modules/database/matches/match.model'
import { MatchEventsEnum, MatchHandler } from '@modules/match/lib/match.handler'
import { UserModel } from '@modules/database/users/user.model'
import { MatchesService } from '@/modules/database/matches/matches.service'

// Problema em aberto: como guardar informação do rating aqui sem acoplar o history-writter ao rating service?

export class HistoryWriter {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly usersService: UsersService,
    private readonly whiteUser: UserModel,
    private readonly blackUser: UserModel,
    private readonly gameMode: GameMode,
  ) {}

  public observe(matchHandler: MatchHandler) {
    const events: HistoryMatchEvent[] = []

    matchHandler.observe(MatchEventsEnum.Choice, (side, choice, time) => {
      events.push({
        event: HistoryMatchEventsEnum.Choice,
        choice,
        side,
        time,
      })
    })

    matchHandler.observe(MatchEventsEnum.Forfeit, (side, time) => {
      events.push({
        event: HistoryMatchEventsEnum.Forfeit,
        time,
        side,
      })
    })

    matchHandler.observe(MatchEventsEnum.Timeout, (side, time) => {
      events.push({
        event: HistoryMatchEventsEnum.Timeout,
        time,
        side,
      })
    })

    matchHandler.observe(MatchEventsEnum.Finish, async (winner) => {
      const historyMatch: MatchModel = {
        _id: '',
        white: {
          uid: this.whiteUser._id,
          name: this.whiteUser.nickname,
          score: Math.floor(this.whiteUser.glicko.rating),
          gain: 0,
        },
        black: {
          uid: this.blackUser._id,
          name: this.blackUser.nickname,
          score: Math.floor(this.blackUser.glicko.rating),
          gain: 0,
        },
        gameMode: this.gameMode,
        timestamp: new Date(),
        events,
        winner,
      }

      await this.matchesService.create(historyMatch)
    })
  }
}
