import { Inject, Injectable } from '@nestjs/common'

import {
  BotConfig,
  BotName,
  ConfigService,
  DatabaseService,
  GameMode,
  Glicko,
  SidesEnum,
  UserModel,
  UsersService,
} from '@database'
import { SocketsService } from '@common'
import { MatchSocketEmitMap } from '../types'
import { DatabaseSyncService } from './database-sync.service'
import { ClientSyncService } from './client-sync.service'
import { BaseBot, LmmBot, RandomBot } from '../bots'
import { MatchBank } from '../lib'

export type MatchPlayerProfile = {
  uid: string
  nickname: string
  glicko: Glicko
}

// Stores all matches that are currently in progress.
@Injectable()
export class MatchService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly databaseSyncService: DatabaseSyncService,
    @Inject('MatchSocketsService')
    private readonly matchSocketsService: SocketsService<MatchSocketEmitMap>,
    private readonly clientMessageService: ClientSyncService,
    private readonly matchBank: MatchBank,
  ) {}

  private getBot(botConfig: BotConfig): BaseBot {
    return botConfig.model === 'lmm'
      ? new LmmBot(botConfig.depth)
      : new RandomBot()
  }

  private async getProfile(uid: string): Promise<UserModel> {
    const profile = await this.usersService.get(uid)
    if (!profile) throw new Error(`Could not find profile for bot ${uid}.`)
    return profile
  }

  async createPvCMatch(uid: string, botName: BotName) {
    const { match, id } = this.matchBank.createAndRegisterMatch(1000 * 105)

    // Get profiles
    const humanProfilePromise = this.getProfile(uid)
    const botConfig = await this.configService.getBotConfig(botName)
    if (!botConfig) throw new Error(`Could not find config for bot ${botName}.`)
    const botProfile = await this.getProfile(botConfig.uid)
    const humanProfile = await humanProfilePromise

    const bot = this.getBot(botConfig)

    // Define sides and get adapters
    const humanSide = Math.round(Math.random()) as SidesEnum
    const [playerAdapter, botAdapter] = this.matchBank.assignAdapters(
      match,
      [uid, botProfile._id],
      humanSide,
    )

    // Sync
    bot.observe(botAdapter)
    this.clientMessageService.sync(playerAdapter, uid)
    this.databaseSyncService.sync(
      match,
      humanSide === SidesEnum.White ? humanProfile : botProfile,
      humanSide === SidesEnum.White ? botProfile : humanProfile,
      GameMode.Ranked | GameMode.PvC,
    )

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

    // Define sides and get adapters
    const sideOfFirst = <SidesEnum>Math.round(Math.random())
    const [adapter1, adapter2] = this.matchBank.assignAdapters(
      match,
      [uid1, uid2],
      sideOfFirst,
    )

    // Sync
    this.clientMessageService.sync(adapter1, uid1)
    this.clientMessageService.sync(adapter2, uid2)
    this.databaseSyncService.sync(
      match,
      sideOfFirst === SidesEnum.White ? profile1 : profile2,
      sideOfFirst === SidesEnum.White ? profile2 : profile1,
      GameMode.Ranked | GameMode.PvP,
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
}
