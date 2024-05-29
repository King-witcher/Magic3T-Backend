import { Inject, Injectable } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'

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
import { Match, MatchEventsEnum } from '../lib'
import { MatchSideAdapter, MatchSocketEmitMap } from '../types'
import { DatabaseSyncService } from './database-sync.service'
import { ClientSyncService } from './client-sync.service'
import { BaseBot, LmmBot, RandomBot } from '../bots'

export type MatchPlayerProfile = {
  uid: string
  nickname: string
  glicko: Glicko
}

@Injectable()
export class MatchService {
  private matches: Map<string, Match> // Connects matchIds to matches
  private adapters: Map<string, MatchSideAdapter> // Connects uids to matchAdapters
  private opponents: Map<string, string>

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly databaseSyncService: DatabaseSyncService,
    @Inject('MatchSocketsService')
    private readonly matchSocketsService: SocketsService<MatchSocketEmitMap>,
    private readonly clientMessageService: ClientSyncService,
  ) {
    this.matches = new Map()
    this.adapters = new Map()
    this.opponents = new Map()
  }

  private createAndRegisterMatch(
    ...params: ConstructorParameters<typeof Match>
  ): [Match, string] {
    const matchId = this.databaseService.getId()
    const match = new Match(...params)
    this.matches.set(matchId, match)
    match.observe(MatchEventsEnum.Finish, () => {
      this.matches.delete(matchId)
    })
    return [match, matchId]
  }

  getMatch(matchId: string): Match {
    const match = this.matches.get(matchId)
    if (!match) throw new WsException('Match not found')
    return match
  }

  // Assigns uids to a matchId
  private assignAdapters(
    match: Match,
    [uid1, uid2]: [string, string],
    sideOfFirst,
  ): [MatchSideAdapter, MatchSideAdapter] {
    const adapter1 = match.getAdapter(sideOfFirst)
    const adapter2 = match.getAdapter(1 - sideOfFirst)

    this.adapters.set(uid1, adapter1)
    this.adapters.set(uid2, adapter2)
    this.opponents.set(uid1, uid2)
    this.opponents.set(uid2, uid1)

    match.observe(MatchEventsEnum.Finish, () => {
      this.adapters.delete(uid1)
      this.adapters.delete(uid2)
      this.opponents.delete(uid1)
      this.opponents.delete(uid2)
    })

    return [adapter1, adapter2]
  }

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

  getOpponent(uid: string): string {
    const opponentUid = this.opponents.get(uid)
    if (!opponentUid) throw new Error(`Bad uid ${uid}.`)
    return opponentUid
  }

  // Gets the adapter for an uid, if any. Otherwise, create one.
  getAdapter(uid: string): MatchSideAdapter {
    const adapter = this.adapters.get(uid)
    if (!adapter)
      throw new WsException(`Player "${uid}" not currently in a match.`)
    return adapter
  }

  async createPvCMatch(uid: string, botName: BotName) {
    const [match, matchId] = this.createAndRegisterMatch(1000 * 105)

    // Get profiles
    const humanProfilePromise = this.getProfile(uid)
    const botConfig = await this.configService.getBotConfig(botName)
    if (!botConfig) throw new Error(`Could not find config for bot ${botName}.`)
    const botProfile = await this.getProfile(botConfig.uid)
    const humanProfile = await humanProfilePromise

    const bot = this.getBot(botConfig)

    // Define sides and get adapters
    const humanSide = Math.round(Math.random()) as SidesEnum
    const [playerAdapter, botAdapter] = this.assignAdapters(
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
    return matchId
  }

  async createPvPMatch(uid1: string, uid2: string) {
    const [match, matchId] = this.createAndRegisterMatch(1000 * 240)

    // Get profiles
    const [profile1, profile2] = await Promise.all([
      this.getProfile(uid1),
      this.getProfile(uid2),
    ])

    // Define sides and get adapters
    const sideOfFirst = <SidesEnum>Math.round(Math.random())
    const [adapter1, adapter2] = this.assignAdapters(
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
    return matchId
  }

  isAvailable(uid: string) {
    return !this.adapters.has(uid)
  }
}
