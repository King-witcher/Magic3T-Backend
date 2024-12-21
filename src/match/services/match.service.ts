import { Inject, Injectable } from '@nestjs/common'

import { SocketsService } from '@common'
import {
  BotConfig,
  BotName,
  ConfigRepository,
  GameMode,
  Glicko,
  MatchModel,
  MatchRepository,
  SidesEnum,
  UserModel,
  UserRepository,
} from '@database'
import { BaseBot, LmmBot, RandomBot } from '../bots'
import { Match, MatchBank, MatchEventsEnum } from '../lib'
import {
  MatchReportData,
  MatchSocketEmitMap,
  MatchSocketEmittedEvent,
} from '../types'
import { ClientSyncService } from './client-sync.service'
import { DatabaseSyncService } from './database-sync.service'
import { RatingService } from '@/rating'
import { FieldValue, UpdateData } from 'firebase-admin/firestore'
import { WithId } from '@/database/types'

export type MatchPlayerProfile = {
  uid: string
  nickname: string
  glicko: Glicko
}

// Stores all matches that are currently in progress.
@Injectable()
export class MatchService {
  constructor(
    private configRepository: ConfigRepository,
    private userRepository: UserRepository,
    private databaseSyncService: DatabaseSyncService,
    @Inject('MatchSocketsService')
    private matchSocketsService: SocketsService<MatchSocketEmitMap>,
    private readonly matchRepository: MatchRepository,
    private clientSyncService: ClientSyncService,
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

  private getWhiteScore(match: Match, winner: SidesEnum | null) {
    if (winner !== null) return 1 - winner
    const whiteTime = match.timelimit - match[SidesEnum.White].timeLeft
    const blackTime = match.timelimit - match[SidesEnum.Black].timeLeft
    return blackTime / (whiteTime + blackTime)
  }

  // The largest method I ever created 😅
  private async observeMatch(
    match: Match,
    white: UserModel,
    black: UserModel,
    gameMode: GameMode
  ) {
    const whitePerspective = match.getAdapter(SidesEnum.White)
    const blackPerspective = match.getAdapter(SidesEnum.Black)
    match.observe(MatchEventsEnum.Choice, () => {
      if (white.role !== 'bot')
        this.matchSocketsService.emit(
          white._id,
          MatchSocketEmittedEvent.GameState,
          whitePerspective.state
        )
      if (black.role !== 'bot')
        this.matchSocketsService.emit(
          black._id,
          MatchSocketEmittedEvent.GameState,
          blackPerspective.state
        )
    })

    match.observe(MatchEventsEnum.Forfeit, () => {
      if (white.role !== 'bot')
        this.matchSocketsService.emit(
          white._id,
          MatchSocketEmittedEvent.GameState,
          whitePerspective.state
        )
      if (black.role !== 'bot')
        this.matchSocketsService.emit(
          black._id,
          MatchSocketEmittedEvent.GameState,
          blackPerspective.state
        )
    })

    match.observe(MatchEventsEnum.Timeout, () => {
      if (white.role !== 'bot')
        this.matchSocketsService.emit(
          white._id,
          MatchSocketEmittedEvent.GameState,
          whitePerspective.state
        )
      if (black.role !== 'bot')
        this.matchSocketsService.emit(
          black._id,
          MatchSocketEmittedEvent.GameState,
          blackPerspective.state
        )
    })

    match.observe(MatchEventsEnum.Finish, async (_, winner) => {
      const events = match.events
      const whiteScore = this.getWhiteScore(match, winner)

      const whiteUpdateData: UpdateData<UserModel> & WithId = {
        _id: white._id,
        'stats.defeats': FieldValue.increment(
          winner === SidesEnum.Black ? 1 : 0
        ),
        'stats.draws': FieldValue.increment(winner === null ? 1 : 0),
        'stats.wins': FieldValue.increment(winner === SidesEnum.White ? 1 : 0),
      }

      const blackUpdateData: UpdateData<UserModel> & WithId = {
        _id: black._id,
        'stats.defeats': FieldValue.increment(
          winner === SidesEnum.White ? 1 : 0
        ),
        'stats.draws': FieldValue.increment(winner === null ? 1 : 0),
        'stats.wins': FieldValue.increment(winner === SidesEnum.Black ? 1 : 0),
      }

      const historyMatch: MatchModel = {
        _id: match.id,
        white: {
          uid: white._id,
          name: white.identification?.nickname || '',
          score: whiteScore,
          rating: white.glicko.rating,
          gain: 0,
        },
        black: {
          uid: black._id,
          name: black.identification?.nickname || '',
          score: 1 - whiteScore,
          rating: black.glicko.rating,
          gain: 0,
        },
        gameMode,
        timestamp: new Date(),
        events,
        winner,
      }

      const matchReport: MatchReportData = {
        matchId: match.id,
        winner,
        white: {
          score: whiteScore,
          gain: 0,
          newRating: white.glicko,
        },
        black: {
          score: 1 - whiteScore,
          gain: 0,
          newRating: black.glicko,
        },
      }

      if (gameMode & GameMode.Ranked) {
        const [whiteGlicko, blackGlicko] = await this.ratingService.getRatings(
          white,
          black,
          whiteScore
        )

        whiteUpdateData.glicko = whiteGlicko
        blackUpdateData.glicko = blackGlicko

        historyMatch.white.gain = whiteGlicko.rating - white.glicko.rating
        historyMatch.black.gain = blackGlicko.rating - black.glicko.rating

        matchReport.white.gain = whiteGlicko.rating - white.glicko.rating
        matchReport.black.gain = blackGlicko.rating - black.glicko.rating
        matchReport.white.newRating = whiteGlicko
        matchReport.black.newRating = blackGlicko
      }

      // Update everything in the database
      await Promise.all([
        this.matchRepository.create(historyMatch),
        this.userRepository.update(whiteUpdateData),
        this.userRepository.update(blackUpdateData),
      ])

      // Finally, emits the final report
      if (white.role !== 'bot')
        this.matchSocketsService.emit(
          white._id,
          MatchSocketEmittedEvent.MatchReport,
          matchReport
        )

      if (black.role !== 'bot')
        this.matchSocketsService.emit(
          black._id,
          MatchSocketEmittedEvent.MatchReport,
          matchReport
        )
    })
  }

  async createPvCMatch(uid: string, botName: BotName) {
    const { match, id } = this.matchBank.createAndRegisterMatch(1000 * 105)

    // Get profiles
    const humanProfilePromise = this.getProfile(uid)
    const botConfig = await this.configRepository.getBotConfig(botName)
    if (!botConfig) throw new Error(`Could not find config for bot ${botName}.`)
    const botProfile = await this.getProfile(botConfig.uid)
    const humanProfile = await humanProfilePromise

    const bot = this.getBot(botConfig)

    // Define sides and get perspectives
    const humanSide = Math.round(Math.random()) as SidesEnum
    const [_, botPerspective] = this.matchBank.createPerspectives(
      match,
      [uid, botProfile._id],
      humanSide
    )

    // Sync
    bot.observe(botPerspective)
    this.observeMatch(
      match,
      humanSide === SidesEnum.White ? humanProfile : botProfile,
      humanSide === SidesEnum.White ? botProfile : humanProfile,
      GameMode.Ranked | GameMode.PvC
    )
    // this.clientSyncService.sync(playerPerspective, uid)
    // this.databaseSyncService.sync(
    //   match,
    //   id,
    //   humanSide === SidesEnum.White ? humanProfile : botProfile,
    //   humanSide === SidesEnum.White ? botProfile : humanProfile,
    //   GameMode.Ranked | GameMode.PvC
    // )

    // Start match
    match.start()
    return id
  }

  async createPvPMatch(uid1: string, uid2: string) {
    const { match, id } = this.matchBank.createAndRegisterMatch(1000 * 240)

    // Get profiles
    const [profile1, profile2] = await Promise.all([
      this.getProfile(uid1),
      this.getProfile(uid2),
    ])

    // Define sides and get perspectives
    const sideOfFirst = <SidesEnum>Math.round(Math.random())
    this.matchBank.createPerspectives(match, [uid1, uid2], sideOfFirst)

    // Sync
    this.observeMatch(
      match,
      sideOfFirst === SidesEnum.White ? profile1 : profile2,
      sideOfFirst === SidesEnum.White ? profile2 : profile1,
      GameMode.Ranked | GameMode.PvP
    )
    // this.clientSyncService.sync(perspective1, uid1)
    // this.clientSyncService.sync(perspective2, uid2)
    // this.databaseSyncService.sync(
    //   match,
    //   id,
    //   sideOfFirst === SidesEnum.White ? profile1 : profile2,
    //   sideOfFirst === SidesEnum.White ? profile2 : profile1,
    //   GameMode.Ranked | GameMode.PvP
    // )

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
}
