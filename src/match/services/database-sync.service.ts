import { UserModel } from './../../database/users/user.model'
import { Observable } from '@/lib/observable'
import { Injectable } from '@nestjs/common'
import { MatchEventsEnum, MatchEventsMap } from '../lib/match'
import { RatingService } from '@/rating/rating.service'
import {
  GameMode,
  HistoryMatchEvent,
  HistoryMatchEventsEnum,
  MatchModel,
} from '@/database/matches/match.model'
import { MatchesService } from '@/database/matches/matches.service'
import { UsersService } from '@/database/users/users.service'

@Injectable()
export class DatabaseSyncService {
  constructor(
    private readonly ratingService: RatingService,
    private readonly matchesService: MatchesService,
    private readonly usersService: UsersService,
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
  ) {
    match.observe(MatchEventsEnum.Finish, async (winner) => {
      const whiteScore = winner === null ? 0.5 : 1 - winner

      const [whiteRating, blackRating] = await this.ratingService.getRatings(
        white,
        black,
        whiteScore,
      )

      this.usersService.updateGlicko(white._id, whiteRating)
      this.usersService.updateGlicko(black._id, blackRating)
    })
  }

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
