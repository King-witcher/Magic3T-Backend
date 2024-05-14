import {
  HistoryMatchEventsEnum,
  HistoryMatchEvent,
  MatchModel,
  GameModesEnum,
} from '@modules/database/matches/match.model'
import { MatchEventsEnum, MatchHandler } from '@modules/match/lib/match.handler'

export class HistoryWriter {
  constructor(
    private readonly whiteProfile: any,
    private readonly blackProfile: any,
    private readonly gameMode: GameModesEnum,
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

    matchHandler.observe(MatchEventsEnum.Finish, (winner) => {
      const historyMatch: MatchModel = {
        _id: '',
        white: this.whiteProfile,
        black: this.blackProfile,
        gameMode: this.gameMode,
        timestamp: new Date(),
        events,
        winner,
      }

      console.log(historyMatch)
    })
  }
}
