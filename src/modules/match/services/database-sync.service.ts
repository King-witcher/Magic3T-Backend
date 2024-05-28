import {
  GameMode,
  HistoryMatchEvent,
} from './../../database/matches/match.model'
import { UserModel } from './../../database/users/user.model'
import { Observable } from '@/lib/observable'
import { Injectable } from '@nestjs/common'
import { MatchEventsEnum, MatchEventsMap } from '../lib/match.handler'
import { RatingService } from '@/modules/rating/rating.service'
import {
  HistoryMatchEventsEnum,
  MatchModel,
} from '@/modules/database/matches/match.model'
import { MatchesService } from '@/modules/database/matches/matches.service'

@Injectable()
export class DatabaseSyncService {
  constructor(
    private readonly ratingService: RatingService,
    private readonly matchesService: MatchesService,
  ) {}

  syncHistory(
    match: Observable<MatchEventsMap>,
    white: UserModel,
    black: UserModel,
    gameMode: GameMode,
  ) {
    const events: HistoryMatchEvent[] = []

    match.observe(MatchEventsEnum.Choice, (side, choice, time) => {
      events.push({
        event: HistoryMatchEventsEnum.Choice,
        choice,
        side,
        time,
      })
    })

    match.observe(MatchEventsEnum.Forfeit, (side, time) => {
      events.push({
        event: HistoryMatchEventsEnum.Forfeit,
        time,
        side,
      })
    })

    match.observe(MatchEventsEnum.Timeout, (side, time) => {
      events.push({
        event: HistoryMatchEventsEnum.Timeout,
        time,
        side,
      })
    })

    match.observe(MatchEventsEnum.Finish, async (winner) => {
      const historyMatch: MatchModel = {
        _id: '',
        white: {
          uid: white._id,
          name: white.nickname,
          score: Math.floor(white.glicko.rating),
          gain: 0,
        },
        black: {
          uid: black._id,
          name: black.nickname,
          score: Math.floor(black.glicko.rating),
          gain: 0,
        },
        gameMode,
        timestamp: new Date(),
        events,
        winner,
      }

      console.log(historyMatch)
      await this.matchesService.create(historyMatch)
    })
  }

  syncRatings(
    match: Observable<MatchEventsMap>,
    white: UserModel,
    black: UserModel,
  ) {}

  sync(
    match: Observable<MatchEventsMap>,
    white: UserModel,
    black: UserModel,
    gameMode: GameMode,
  ) {
    this.syncHistory(match, white, black, gameMode)
    if (gameMode & GameMode.Ranked) {
      this.syncRatings(match, white, black)
    }
  }
}
