import { Inject, Injectable } from '@nestjs/common'
import { MatchEventsEnum, MatchHandler } from '@modules/match/lib/match.handler'
import { DatabaseService } from '@modules/database/database.service'
import { IMatchAdapter } from '@modules/match/lib/adapters/matchAdapter'
import { BotNames } from '@modules/database/config/bot-config.model'
import { ConfigService } from '@modules/database/config/config.service'
import { ClientNotifier } from '@modules/match/lib/observers/client.notifier'
import { SocketsService } from '@modules/sockets.service'
import { MatchSocketEmitMap } from '@modules/match/types/MatchSocket'
import { RandomBot } from '@modules/match/lib/observers/bots/random.bot'
import { UsersService } from '@modules/database/users/users.service'
import { WsException } from '@nestjs/websockets'
import { LocalMinMaxBot } from '@modules/match/lib/observers/bots/localMinMaxBot'
import { BaseBot } from '@modules/match/lib/observers/bots/baseBot'
import { Glicko } from '@modules/database/users/user.model'
import { GameModesEnum, SidesEnum } from '@modules/database/matches/match.model'
import { HistoryWriter } from '@modules/match/lib/observers/history.writer'

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
    private databaseService: DatabaseService,
    private configService: ConfigService,
    private usersService: UsersService,
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
    randomize = true,
  ): [IMatchAdapter, IMatchAdapter] {
    const sideOfFirst: SidesEnum = randomize ? Math.round(Math.random()) : 0
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

  private async getBot(botName: BotNames): Promise<{
    bot: BaseBot
    botProfile: MatchPlayerProfile
  }> {
    const botConfigs = await this.configService.botConfigs()
    const botConfig = botConfigs[botName]
    if (!botConfig)
      throw new WsException(`Unable to find bot config for "${botName}".`)

    const bot: BaseBot =
      botConfig.model === 'lmm'
        ? new LocalMinMaxBot(botConfig.depth)
        : new RandomBot()

    const botUserData = await this.usersService.get(botConfig.uid)
    if (!botUserData)
      throw new WsException(`Could not find bot profile for "${botName}".`)

    return {
      bot,
      botProfile: {
        uid: botUserData._id,
        glicko: botUserData.glicko,
        nickname: botUserData.nickname,
      },
    }
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

  async createPvCMatch(uid: string, botName: BotNames) {
    const { bot, botProfile } = await this.getBot(botName)

    const [match, matchId] = this.createAndRegisterMatch(1000 * 105)

    // Declare observers
    const historyWritter = new HistoryWriter(
      null,
      null,
      GameModesEnum.RankedPvC,
    )
    const clientNotifier = new ClientNotifier(uid, this.matchSocketsService)

    // Get adapters
    const [playerAdapter, botAdapter] = this.assignAdapters(match, [
      uid,
      botProfile.uid,
    ])

    // Observe
    bot.observe(botAdapter)
    historyWritter.observe(match)
    clientNotifier.observe(playerAdapter)

    // Start match
    match.start()
    return matchId
  }

  createPvPMatch(profile1: MatchPlayerProfile, profile2: MatchPlayerProfile) {
    const [match, matchId] = this.createAndRegisterMatch(1000 * 240)

    const historyWriter = new HistoryWriter(null, null, GameModesEnum.RankedPvP)

    const [adapter1, adapter2] = this.assignAdapters(match, [
      profile1.uid,
      profile2.uid,
    ])

    const clientNotifier1 = new ClientNotifier(
      profile1.uid,
      this.matchSocketsService,
    )

    const clientNotifier2 = new ClientNotifier(
      profile2.uid,
      this.matchSocketsService,
    )

    historyWriter.observe(match)
    clientNotifier1.observe(adapter1)
    clientNotifier2.observe(adapter2)

    match.start()
    return matchId
  }

  isAvailable(uid: string) {
    return !this.adapters.has(uid)
  }
}
