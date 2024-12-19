import { Inject, Injectable } from '@nestjs/common'

import { SocketsService } from '@common'
import {
  BotConfig,
  BotName,
  ConfigRepository,
  GameMode,
  Glicko,
  SidesEnum,
  UserModel,
  UserRepository,
} from '@database'
import { BaseBot, LmmBot, RandomBot } from '../bots'
import { MatchBank } from '../lib'
import { MatchSocketEmitMap } from '../types'
import { ClientSyncService } from './client-sync.service'
import { DatabaseSyncService } from './database-sync.service'

export type MatchPlayerProfile = {
  uid: string
  nickname: string
  glicko: Glicko
}

// Stores all matches that are currently in progress.
@Injectable()
export class MatchService {
  constructor(
    private readonly configRepository: ConfigRepository,
    private readonly userRepository: UserRepository,
    private readonly databaseSyncService: DatabaseSyncService,
    @Inject('MatchSocketsService')
    private readonly matchSocketsService: SocketsService<MatchSocketEmitMap>,
    private readonly clientMessageService: ClientSyncService,
    private readonly matchBank: MatchBank
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
    const [playerPerspective, botPerspective] =
      this.matchBank.createPerspectives(match, [uid, botProfile._id], humanSide)

    // Sync
    bot.observe(botPerspective)
    this.clientMessageService.sync(playerPerspective, uid)
    this.databaseSyncService.sync(
      match,
      id,
      humanSide === SidesEnum.White ? humanProfile : botProfile,
      humanSide === SidesEnum.White ? botProfile : humanProfile,
      GameMode.Ranked | GameMode.PvC
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

    // Define sides and get perspectives
    const sideOfFirst = <SidesEnum>Math.round(Math.random())
    const [perspective1, perspective2] = this.matchBank.createPerspectives(
      match,
      [uid1, uid2],
      sideOfFirst
    )

    // Sync
    this.clientMessageService.sync(perspective1, uid1)
    this.clientMessageService.sync(perspective2, uid2)
    this.databaseSyncService.sync(
      match,
      id,
      sideOfFirst === SidesEnum.White ? profile1 : profile2,
      sideOfFirst === SidesEnum.White ? profile2 : profile1,
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
}
