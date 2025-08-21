import { ConfigRepository, MatchRepository, UserRepository } from '@database'
import {
  BotConfig,
  BotName,
  GameMode,
  GetMatchesResult,
  Team,
  UserRow,
} from '@magic3t/types'
import { Injectable } from '@nestjs/common'
import { clamp } from 'lodash'
import { BaseBot, LmmBot, RandomBot } from './bots'
import { MatchBank, Perspective } from './lib'
import { MatchObserverService } from './state-report.service'
import { MatchPayload } from './swagger/match-payload'

@Injectable()
export class MatchService {
  constructor(
    private configRepository: ConfigRepository,
    private userRepository: UserRepository,
    private matchRepository: MatchRepository,
    private matchBank: MatchBank,
    private matchObserverService: MatchObserverService
  ) {}

  private getBot(botConfig: BotConfig, perspective: Perspective): BaseBot {
    return botConfig.model === 'lmm'
      ? new LmmBot(perspective, botConfig.depth)
      : new RandomBot(perspective)
  }

  private async getProfile(uid: string): Promise<UserRow> {
    const profile = await this.userRepository.get(uid)
    if (!profile) throw new Error(`Could not find profile for bot ${uid}.`)
    return profile
  }

  async createPvCMatch(uid: string, botName: BotName) {
    // Get profiles
    const humanProfilePromise = this.getProfile(uid)
    const botConfig = await this.configRepository.getBotConfig(botName)
    if (!botConfig) throw new Error(`Could not find config for bot ${botName}.`)
    const botProfile = await this.getProfile(botConfig.uid)
    const humanProfile = await humanProfilePromise

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
    const bot = this.getBot(botConfig, botPerspective)

    // Sync
    this.matchObserverService.observe(
      match,
      humanTeam === Team.Order ? humanProfile : botProfile,
      humanTeam === Team.Order ? botProfile : humanProfile,
      GameMode.Ranked | GameMode.PvC
    )

    // Start match
    match.start()
    bot.start()
    return id
  }

  async createCvCMatch(name1: BotName, name2: BotName) {
    const botConfig1 = await this.configRepository.getBotConfig(name1)
    const botConfig2 = await this.configRepository.getBotConfig(name2)

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

    const bot1 = this.getBot(botConfig1, perspective1)
    const bot2 = this.getBot(botConfig2, perspective2)

    this.matchObserverService.observe(
      match,
      botProfile1,
      botProfile2,
      GameMode.Ranked | GameMode.PvP
    )

    match.start()
    bot1.start()
    bot2.start()
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
    this.matchObserverService.observe(
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

  async getMatchesByUser(
    userId: string,
    limit: number
  ): Promise<GetMatchesResult> {
    const clampedLimit = clamp(limit, 0, 50)
    const rows = await this.matchRepository.getByUser(userId, clampedLimit)
    const payloads = await Promise.all(
      rows.map((model) => MatchPayload.fromRow(model))
    )
    return {
      matches: payloads,
      cursor: null,
    }
  }
}
