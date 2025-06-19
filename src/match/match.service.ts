import { Inject, Injectable } from '@nestjs/common'

import { MatchDto } from '@/database/match/match.dto'
import { RatingService } from '@/rating'
import { SocketsService, Team } from '@common'
import {
  BotConfig,
  BotName,
  ConfigRepository,
  GameMode,
  MatchModel,
  MatchRepository,
  GlickoModel,
  UserModel,
  UserRepository,
} from '@database'
import { clamp } from 'lodash'
import { BaseBot, LmmBot, RandomBot } from './bots'
import { Match, MatchBank, MatchEventType } from './lib'
import {
  MatchReportDto,
  MatchServerEventsMap,
  ServerMatchEvents,
} from './types'
import { deepClone } from '@/common/utils/misc'

export type MatchPlayerProfile = {
  uid: string
  nickname: string
  glicko: GlickoModel
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

      const orderRatingDto = await this.ratingService.getRatingDto(order)
      const chaosRatingDto = await this.ratingService.getRatingDto(chaos)

      const newOrder = deepClone(order)
      const newChaos = deepClone(chaos)

      // Update stats
      switch (winner) {
        case Team.Order: {
          newOrder.stats.wins++
          newChaos.stats.defeats++
          break
        }
        case Team.Chaos: {
          newChaos.stats.wins++
          newOrder.stats.defeats++
          break
        }
        case null: {
          newOrder.stats.draws++
          newChaos.stats.draws++
          break
        }
      }

      const historyMatch: MatchModel = {
        _id: match.id,
        [Team.Order]: {
          uid: order._id,
          name: order.identification?.nickname || '',
          score: orderScore,
          league: orderRatingDto.league,
          division: orderRatingDto.division,
          lp_gain: 0,
        },
        [Team.Chaos]: {
          uid: chaos._id,
          name: chaos.identification?.nickname || '',
          score: 1 - orderScore,
          league: chaosRatingDto.league,
          division: chaosRatingDto.division,
          lp_gain: 0,
        },
        game_mode: gameMode,
        timestamp: new Date(),
        events,
        winner,
      }

      // Sets with initial values. If the match is ranked, then update the rating values.
      const matchReport: MatchReportDto = {
        matchId: match.id,
        winner,
        [Team.Order]: {
          score: orderScore,
          lpGain: 0,
          newRating: await this.ratingService.getRatingDto(order),
        },
        [Team.Chaos]: {
          score: 1 - orderScore,
          lpGain: 0,
          newRating: await this.ratingService.getRatingDto(chaos),
        },
      }

      if (gameMode & GameMode.Ranked) {
        await this.ratingService.update(newOrder, newChaos, orderScore)
        const orderGain =
          (await this.ratingService.getTotalLp(newOrder)) -
          (await this.ratingService.getTotalLp(order))

        const chaosGain =
          (await this.ratingService.getTotalLp(newChaos)) -
          (await this.ratingService.getTotalLp(chaos))

        historyMatch[Team.Order].lp_gain = orderGain
        historyMatch[Team.Chaos].lp_gain = chaosGain

        matchReport[Team.Order].lpGain = orderGain
        matchReport[Team.Chaos].lpGain = chaosGain

        matchReport[Team.Order].newRating =
          await this.ratingService.getRatingDto(newOrder)
        matchReport[Team.Chaos].newRating =
          await this.ratingService.getRatingDto(newChaos)
      }

      // Update everything in the database
      await Promise.all([
        this.matchRepository.create(historyMatch),
        this.userRepository.update(newOrder),
        this.userRepository.update(newChaos),
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

    const [botProfile1, botProfile2] = await Promise.all([
      this.getProfile(botConfig1.uid),
      this.getProfile(botConfig2.uid),
    ])

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
    const dtos = await Promise.all(
      models.map((model) => MatchDto.fromModel(model))
    )
    return dtos
  }
}
