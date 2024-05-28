import { UsersService } from './../database/users/users.service'
import { Inject, Injectable } from '@nestjs/common'
import { MatchEventsEnum, MatchHandler } from '@modules/match/lib/match.handler'
import { DatabaseService } from '@modules/database/database.service'
import { IMatchAdapter } from '@modules/match/lib/adapters/matchAdapter'
import { BotConfig, BotName } from '@modules/database/config/models'
import { ConfigService } from '@modules/database/config/config.service'
import { ClientNotifier } from '@modules/match/lib/observers/client-notifier'
import { SocketsService } from '@modules/sockets.service'
import { MatchSocketEmitMap } from '@modules/match/types/MatchSocket'
import { RandomBot } from '@modules/match/lib/observers/bots/random-bot'
import { WsException } from '@nestjs/websockets'
import { LmmBot } from '@modules/match/lib/observers/bots/lmm-bot'
import { BaseBot } from '@modules/match/lib/observers/bots/base-bot'
import { Glicko, UserModel } from '@modules/database/users/user.model'
import { GameMode, SidesEnum } from '@modules/database/matches/match.model'
import { MatchesService } from '../database/matches/matches.service'
import { DatabaseSyncService } from './services/database-sync.service'

export type MatchPlayerProfile = {
  uid: string
  nickname: string
  glicko: Glicko
}

@Injectable()
export class MatchService {
  private matches: Map<string, MatchHandler> // Connects matchIds to matches
  private adapters: Map<string, IMatchAdapter> // Connects uids to matchAdapters
  private opponents: Map<string, string>

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly databaseSyncService: DatabaseSyncService,
    @Inject('MatchSocketsService')
    private matchSocketsService: SocketsService<MatchSocketEmitMap>,
  ) {
    this.matches = new Map()
    this.adapters = new Map()
    this.opponents = new Map()
  }

  private createAndRegisterMatch(
    ...params: ConstructorParameters<typeof MatchHandler>
  ): [MatchHandler, string] {
    const matchId = this.databaseService.getId()
    const match = new MatchHandler(...params)
    this.matches.set(matchId, match)
    match.observe(MatchEventsEnum.Finish, () => {
      this.matches.delete(matchId)
    })
    return [match, matchId]
  }

  getMatch(matchId: string): MatchHandler {
    const match = this.matches.get(matchId)
    if (!match) throw new WsException('Match not found')
    return match
  }

  // Assigns uids to a matchId
  private assignAdapters(
    match: MatchHandler,
    [uid1, uid2]: [string, string],
    sideOfFirst,
  ): [IMatchAdapter, IMatchAdapter] {
    const adapter1 = match.getAdapter(sideOfFirst)
    const adapter2 = match.getAdapter(1 - sideOfFirst)

    this.adapters.set(uid1, adapter1)
    this.adapters.set(uid2, adapter2)
    this.opponents.set(uid1, uid2)
    this.opponents.set(uid2, uid1)

    console.log(uid1, uid2)

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
  getAdapter(uid: string): IMatchAdapter {
    const adapter = this.adapters.get(uid)
    if (!adapter)
      throw new WsException(`Player "${uid}" not currently in a match.`)
    return adapter
  }

  async createPvCMatch(uid: string, botName: BotName) {
    // Get profiles
    const humanProfilePromise = this.getProfile(uid)
    const botConfig = await this.configService.getBotConfig(botName)
    if (!botConfig) throw new Error(`Could not find config for bot ${botName}.`)
    const botProfile = await this.getProfile(botConfig.uid)
    const humanProfile = await humanProfilePromise

    const bot = this.getBot(botConfig)
    const [match, matchId] = this.createAndRegisterMatch(1000 * 105)

    // Declare observers
    const humanSide = Math.round(Math.random()) as SidesEnum

    const clientNotifier = new ClientNotifier(uid, this.matchSocketsService)

    // Get adapters
    const [playerAdapter, botAdapter] = this.assignAdapters(
      match,
      [uid, botProfile._id],
      humanSide,
    )

    // Observe
    bot.observe(botAdapter)
    clientNotifier.observe(playerAdapter)

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

  createPvPMatch(profile1: MatchPlayerProfile, profile2: MatchPlayerProfile) {
    const [match, matchId] = this.createAndRegisterMatch(1000 * 240)

    // const historyWriter = new HistoryWriter(
    //   null,
    //   null,
    //   HistoryGameMode.Ranked | HistoryGameMode.PvP,
    // )

    const [adapter1, adapter2] = this.assignAdapters(
      match,
      [profile1.uid, profile2.uid],
      SidesEnum.White,
    )

    const clientNotifier1 = new ClientNotifier(
      profile1.uid,
      this.matchSocketsService,
    )

    const clientNotifier2 = new ClientNotifier(
      profile2.uid,
      this.matchSocketsService,
    )

    // historyWriter.observe(match)
    clientNotifier1.observe(adapter1)
    clientNotifier2.observe(adapter2)

    match.start()
    return matchId
  }

  isAvailable(uid: string) {
    return !this.adapters.has(uid)
  }
}
