import { Injectable } from '@nestjs/common'

import { Observable } from '@/lib'
import {
  GameMode,
  HistoryMatchEvent,
  HistoryMatchEventsEnum,
  MatchModel,
  MatchRepository,
  SidesEnum,
  UserModel,
  UserRepository,
} from '@database'
import { RatingService } from '@rating'
import { FieldValue } from 'firebase-admin/firestore'
import { MatchEventsEnum, MatchEventsMap } from '../lib'

@Injectable()
export class DatabaseSyncService {
  constructor(
    private readonly ratingService: RatingService,
    private readonly matchRepository: MatchRepository,
    private readonly userRepository: UserRepository
  ) {}

  syncHistory(
    match: Observable<MatchEventsMap>,
    id: string,
    white: UserModel,
    black: UserModel,
    gameMode: GameMode
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

    match.observe(MatchEventsEnum.Finish, async (_, winner) => {
      const whiteScore = winner === null ? 0.5 : 1 - winner
      const [newWhiteRating, newBlackRating] =
        await this.ratingService.getRatings(white, black, whiteScore)

      const historyMatch: MatchModel = {
        _id: id,
        white: {
          uid: white._id,
          name: white.identification?.nickname || '',
          score: white.glicko.rating,
          gain: newWhiteRating.rating - white.glicko.rating,
        },
        black: {
          uid: black._id,
          name: black.identification?.nickname || '',
          score: black.glicko.rating,
          gain: newBlackRating.rating - black.glicko.rating,
        },
        gameMode,
        timestamp: new Date(),
        events,
        winner,
      }

      await this.matchRepository.create(historyMatch)
    })
  }

  syncUsers(
    match: Observable<MatchEventsMap>,
    white: UserModel,
    black: UserModel
  ) {
    match.observe(MatchEventsEnum.Finish, async (match, winner) => {
      let whiteScore = winner !== null ? 1 - winner : 0.5

      if (winner === null) {
        const whiteTime = match.timelimit - match[SidesEnum.White].timeLeft
        const blackTime = match.timelimit - match[SidesEnum.Black].timeLeft

        const timeBunus = blackTime / (whiteTime + blackTime) - 0.5 // ]-0.5, 0.5[

        whiteScore += timeBunus
      }

      const [whiteRating, blackRating] = await this.ratingService.getRatings(
        white,
        black,
        whiteScore
      )

      this.userRepository.update({
        _id: white._id,
        glicko: whiteRating,
        experience: FieldValue.increment(0),
        'stats.defeats': FieldValue.increment(
          winner === SidesEnum.Black ? 1 : 0
        ),
        'stats.draws': FieldValue.increment(winner === null ? 1 : 0),
        'stats.wins': FieldValue.increment(winner === SidesEnum.White ? 1 : 0),
      })

      this.userRepository.update({
        _id: black._id,
        glicko: blackRating,
        experience: FieldValue.increment(0),
        'stats.defeats': FieldValue.increment(
          winner === SidesEnum.White ? 1 : 0
        ),
        'stats.draws': FieldValue.increment(winner === null ? 1 : 0),
        'stats.wins': FieldValue.increment(winner === SidesEnum.Black ? 1 : 0),
      })
    })
  }

  sync(
    match: Observable<MatchEventsMap>,
    id: string,
    white: UserModel,
    black: UserModel,
    gameMode: GameMode
  ) {
    this.syncHistory(match, id, white, black, gameMode)
    if (gameMode & GameMode.Ranked) {
      this.syncUsers(match, white, black)
    }
  }
}
