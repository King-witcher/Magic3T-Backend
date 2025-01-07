import { Inject, Injectable } from '@nestjs/common'

import { MatchDto } from '@/database/match/match.dto'
import { WithId } from '@/database/types'
import { RatingService } from '@/rating'
import { SocketsService, Team } from '@common'
import {
  BotConfig,
  BotName,
  ConfigRepository,
  GameMode,
  RatingModel,
  MatchModel,
  MatchRepository,
  UserModel,
  UserRepository,
} from '@database'
import { FieldValue, UpdateData } from 'firebase-admin/firestore'
import { clamp } from 'lodash'
import { BaseBot, LmmBot, RandomBot } from './bots'
import { Match, MatchBank, MatchEventType } from './lib'
import {
  MatchReportDto,
  MatchServerEventsMap,
  ServerMatchEvents,
} from './types'

export type MatchPlayerProfile = {
  uid: string
  nickname: string
  glicko: RatingModel
}

// Stores all matches that are currently in progress.
@Injectable()
export class MatchService {
  constructor(
    private configRepository: ConfigRepository,
    private userRepository: UserRepository,
    @Inject('MatchSocketsService')
    private matchSocketsService: SocketsService<MatchServerEventsMap>,
    private readonly matchRepository: MatchRepository,
    private matchBank: MatchBank,
    private ratingService: RatingService
  ) {}

  private getBot(botConfig: BotConfig): BaseBot {
    return botConfig.model === 'lmm'
      ? new LmmBot(botConfig.depth)
      : new RandomBot()
  }

  private async getProfile(uid: string): Promise<UserModel> {
    const profile = await this.userRepository.get(uid)
    if (!profile) throw new Error(`Could not find profile for bot ${uid}.`)
    return profile
  }

  private getWhiteScore(match: Match, winner: Team | null) {
    if (winner !== null) return 1 - winner
    const whiteTime = match.timelimit - match[Team.Order].timer.remaining // TODO: Use Demeter's principle!!!
    const blackTime = match.timelimit - match[Team.Chaos].timer.remaining
    return blackTime / (whiteTime + blackTime)
  }

  private syncStateReport(match: Match, order: UserModel, chaos: UserModel) {
    match.observeMany(
      [MatchEventType.Choice, MatchEventType.Surrender, MatchEventType.Timeout],
      () => {
        const stateReport = match.stateReport

        if (order.role !== 'bot')
          this.matchSocketsService.emit(
            order._id,
            ServerMatchEvents.StateReport,
            stateReport
          )

        if (chaos.role !== 'bot')
          this.matchSocketsService.emit(
            chaos._id,
            ServerMatchEvents.StateReport,
            stateReport
          )
      }
    )
  }

  // The largest method I ever created 😅
  private async observeMatch(
    match: Match,
    order: UserModel,
    chaos: UserModel,
    gameMode: GameMode
  ) {
    this.syncStateReport(match, order, chaos)

    match.observe(MatchEventType.Finish, async (_, winner) => {
      const events = match.events
      const orderScore = this.getWhiteScore(match, winner)

      const orderUD: UpdateData<UserModel> & WithId = {
        _id: order._id,
        'stats.defeats': FieldValue.increment(winner === Team.Chaos ? 1 : 0),
        'stats.draws': FieldValue.increment(winner === null ? 1 : 0),
        'stats.wins': FieldValue.increment(winner === Team.Order ? 1 : 0),
      }

      const chaosUD: UpdateData<UserModel> & WithId = {
        _id: chaos._id,
        'stats.defeats': FieldValue.increment(winner === Team.Order ? 1 : 0),
        'stats.draws': FieldValue.increment(winner === null ? 1 : 0),
        'stats.wins': FieldValue.increment(winner === Team.Chaos ? 1 : 0),
      }

      const historyMatch: MatchModel = {
        _id: match.id,
        [Team.Order]: {
          uid: order._id,
          name: order.identification?.nickname || '',
          score: orderScore,
          rating: order.glicko.rating,
          gain: 0,
        },
        [Team.Chaos]: {
          uid: chaos._id,
          name: chaos.identification?.nickname || '',
          score: 1 - orderScore,
          rating: chaos.glicko.rating,
          gain: 0,
        },
        game_mode: gameMode,
        timestamp: new Date(),
        events,
        winner,
      }

      const matchReport: MatchReportDto = {
        matchId: match.id,
        winner,
        [Team.Order]: {
          score: orderScore,
          gain: 0,
          newRating: {
            date: order.glicko.timestamp.getTime(),
            rd: order.glicko.deviation,
            score: order.glicko.rating,
          },
        },
        [Team.Chaos]: {
          score: 1 - orderScore,
          gain: 0,
          newRating: {
            date: chaos.glicko.timestamp.getTime(),
            rd: chaos.glicko.deviation,
            score: chaos.glicko.rating,
          },
        },
      }

      if (gameMode & GameMode.Ranked) {
        const [orderGlicko, chaosGlicko] = await this.ratingService.getRatings(
          order,
          chaos,
          orderScore
        )

        orderUD.glicko = orderGlicko
        chaosUD.glicko = chaosGlicko

        historyMatch[Team.Order].gain = orderGlicko.rating - order.glicko.rating
        historyMatch[Team.Chaos].gain = chaosGlicko.rating - chaos.glicko.rating

        matchReport[Team.Order].gain = orderGlicko.rating - order.glicko.rating
        matchReport[Team.Chaos].gain = chaosGlicko.rating - chaos.glicko.rating

        matchReport[Team.Order].newRating = {
          date: orderGlicko.timestamp.getTime(),
          rd: orderGlicko.deviation,
          score: orderGlicko.rating,
        }

        matchReport[Team.Chaos].newRating = {
          date: chaosGlicko.timestamp.getTime(),
          rd: chaosGlicko.deviation,
          score: chaosGlicko.rating,
        }
      }

      // Update everything in the database
      await Promise.all([
        this.matchRepository.create(historyMatch),
        this.userRepository.update(orderUD),
        this.userRepository.update(chaosUD),
      ])

      // Finally, emits the final report
      if (order.role !== 'bot')
        this.matchSocketsService.emit(
          order._id,
          ServerMatchEvents.MatchReport,
          matchReport
        )

      if (chaos.role !== 'bot')
        this.matchSocketsService.emit(
          chaos._id,
          ServerMatchEvents.MatchReport,
          matchReport
        )
    })
  }

  async createPvCMatch(uid: string, botName: BotName) {
    // Get profiles
    const humanProfilePromise = this.getProfile(uid)
    const botConfig = await this.configRepository.getBotConfig(botName)
    if (!botConfig) throw new Error(`Could not find config for bot ${botName}.`)
    const botProfile = await this.getProfile(botConfig.uid)
    const humanProfile = await humanProfilePromise
    const bot = this.getBot(botConfig)

    // Define sides and get perspectives
    const humanTeam = Math.round(Math.random()) as Team

    const { match, id } = this.matchBank.createAndRegisterMatch({
      [Team.Order]: humanTeam === Team.Order ? humanProfile : botProfile,
      [Team.Chaos]: humanTeam === Team.Order ? botProfile : humanProfile,
      timelimit: 180 * 1000,
    })

    const [_, botPerspective] = this.matchBank.createPerspectives(
      match,
      [uid, botProfile._id],
      humanTeam
    )

    // Sync
    bot.observe(botPerspective)
    this.observeMatch(
      match,
      humanTeam === Team.Order ? humanProfile : botProfile,
      humanTeam === Team.Order ? botProfile : humanProfile,
      GameMode.Ranked | GameMode.PvC
    )

    // Start match
    match.start()
    return id
  }

  async createCvCMatch(name1: BotName, name2: BotName) {
    const botConfig1 = await this.configRepository.getBotConfig(name1)
    const botConfig2 = await this.configRepository.getBotConfig(name2)

    const bot1 = this.getBot(botConfig1)
    const bot2 = this.getBot(botConfig2)

    const botProfile1 = await this.getProfile(botConfig1.uid)
    const botProfile2 = await this.getProfile(botConfig2.uid)

    const { match, id } = this.matchBank.createAndRegisterMatch({
      [Team.Order]: botProfile1,
      [Team.Chaos]: botProfile2,
      timelimit: 60 * 1000,
    })

    const [perspective1, perspective2] =
      await this.matchBank.createPerspectives(
        match,
        [botConfig1.uid, botConfig2.uid],
        Team.Order
      )

    bot1.observe(perspective1)
    bot2.observe(perspective2)
    this.observeMatch(
      match,
      botProfile1,
      botProfile2,
      GameMode.Ranked | GameMode.PvP
    )

    match.start()
    return match
  }

  async createPvPMatch(uid1: string, uid2: string) {
    // Get profiles
    const [profile1, profile2] = await Promise.all([
      this.getProfile(uid1),
      this.getProfile(uid2),
    ])

    // Define sides and get perspectives
    const sideOfFirst = <Team>Math.round(Math.random())

    const { match, id } = this.matchBank.createAndRegisterMatch({
      [Team.Order]: sideOfFirst === Team.Order ? profile1 : profile2,
      [Team.Chaos]: sideOfFirst === Team.Order ? profile2 : profile1,
      timelimit: 240 * 1000,
    })

    this.matchBank.createPerspectives(match, [uid1, uid2], sideOfFirst)

    // Sync
    this.observeMatch(
      match,
      sideOfFirst === Team.Order ? profile1 : profile2,
      sideOfFirst === Team.Order ? profile2 : profile1,
      GameMode.Ranked | GameMode.PvP
    )

    // Start match
    match.start()
    return id
  }

  getOpponent(userId: string): string {
    return this.matchBank.getOpponent(userId)
  }

  /// Tells if a user is available for creating a new match
  isAvailable(userId: string) {
    return !this.matchBank.containsUser(userId)
  }

  async getMatchesByUser(user: string, limit: number): Promise<MatchDto[]> {
    const clampedLimit = clamp(limit, 0, 50)
    const models = await this.matchRepository.getByUser(user, clampedLimit)
    const dtos = models.map((model) => MatchDto.fromModel(model))
    return dtos
  }
}
