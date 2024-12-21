import { Injectable } from '@nestjs/common'

import { Observable } from '@/lib'
import {
  GameMode,
  HistoryMatchEventsEnum,
  MatchEventModal,
  MatchModel,
  MatchRepository,
  Team,
  UserModel,
  UserRepository,
} from '@database'
import { RatingService } from '@rating'
import { FieldValue } from 'firebase-admin/firestore'
import { Match, MatchEventsEnum, MatchEventsMap } from '../lib'

@Injectable()
export class DatabaseSyncService {
  constructor(
    private readonly ratingService: RatingService,
    private readonly matchRepository: MatchRepository,
    private readonly userRepository: UserRepository
  ) {}

  private getWhiteScore(match: Match, winner: Team | null) {
    if (winner !== null) return 1 - winner
    const whiteTime = match.timelimit - match[Team.Order].timer.remaining // FIXME: Demeter
    const blackTime = match.timelimit - match[Team.Chaos].timer.remaining
    return blackTime / (whiteTime + blackTime)
  }

  syncHistory(
    match: Observable<MatchEventsMap>,
    id: string,
    order: UserModel,
    chaos: UserModel,
    gameMode: GameMode
  ) {
    const events: MatchEventModal[] = []

    match.observe(MatchEventsEnum.Choice, (side, choice, time) => {
      events.push({
        event: HistoryMatchEventsEnum.Choice,
        choice,
        side,
        time,
      })
    })

    match.observe(MatchEventsEnum.Surrender, (side, time) => {
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

    match.observe(MatchEventsEnum.Finish, async (match, winner) => {
      const whiteScore = this.getWhiteScore(match, winner)
      const [newWhiteRating, newBlackRating] =
        await this.ratingService.getRatings(order, chaos, whiteScore)

      const historyMatch: MatchModel = {
        _id: id,
        [Team.Order]: {
          uid: order._id,
          name: order.identification?.nickname || '',
          score: whiteScore,
          rating: order.glicko.rating,
          gain: newWhiteRating.rating - order.glicko.rating,
        },
        [Team.Chaos]: {
          uid: chaos._id,
          name: chaos.identification?.nickname || '',
          score: 1 - whiteScore,
          rating: chaos.glicko.rating,
          gain: newBlackRating.rating - chaos.glicko.rating,
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
      const whiteScore = this.getWhiteScore(match, winner)
      const [whiteRating, blackRating] = await this.ratingService.getRatings(
        white,
        black,
        whiteScore
      )

      this.userRepository.update({
        _id: white._id,
        glicko: whiteRating,
        experience: FieldValue.increment(0),
        'stats.defeats': FieldValue.increment(winner === Team.Chaos ? 1 : 0),
        'stats.draws': FieldValue.increment(winner === null ? 1 : 0),
        'stats.wins': FieldValue.increment(winner === Team.Order ? 1 : 0),
      })

      this.userRepository.update({
        _id: black._id,
        glicko: blackRating,
        experience: FieldValue.increment(0),
        'stats.defeats': FieldValue.increment(winner === Team.Order ? 1 : 0),
        'stats.draws': FieldValue.increment(winner === null ? 1 : 0),
        'stats.wins': FieldValue.increment(winner === Team.Chaos ? 1 : 0),
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
