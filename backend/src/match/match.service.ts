import { ConfigRepository, UserRepository } from '@database'
import {
  GameServerEventsMap,
  GetMatchResult,
  ListMatchesResultItem,
  MatchServerEvents,
} from '@magic3t/api-types'
import { Team } from '@magic3t/common-types'
import { MatchRow, UserRow } from '@magic3t/database-types'
import { BotConfig, BotName } from '@magic3t/types'
import { Inject, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Result, SocketsService } from '@/common'
import { GetResult } from '@/database/types/query-types'
import { RatingService } from '@/rating'
import { BaseBot, LmmBot, RandomBot } from './bots'
import { MatchFinishedEvent } from './events/match-finished-event'
import { Match, MatchBank, MatchClassEventType, MatchClassSummary, Perspective } from './lib'

export type MatchCreationError = 'user-not-found' | 'bot-not-found'
const HUMAN_VS_BOT_TIMELIMIT = 180 * 1000 // 3 minutes per player
const HUMAN_VS_HUMAN_TIMELIMIT = 240 * 1000 // 4 minutes per player

@Injectable()
export class MatchService {
  constructor(
    @Inject('MatchSocketsService')
    private matchSocketsService: SocketsService<GameServerEventsMap>,
    private configRepository: ConfigRepository,
    private userRepository: UserRepository,
    private matchBank: MatchBank,
    private ratingService: RatingService,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Create a new Player vs Bot match.
   */
  async createPlayerVsBot(
    userId: string,
    botId: BotName
  ): Promise<Result<string, MatchCreationError>> {
    // Get profiles
    const userProfilePromise = this.getProfile(userId)
    const botConfig = await this.configRepository.getBotConfig(botId)
    if (!botConfig) return Err('bot-not-found')
    const [userProfile, botProfile] = await Promise.all([
      userProfilePromise,
      this.getProfile(botConfig.uid),
    ])

    if (!userProfile) return Err('user-not-found')
    if (!botProfile) return Err('user-not-found')

    // Coin flip sides
    const humanTeam = Math.round(Math.random()) as Team
    const [orderProfile, chaosProfile] =
      humanTeam === Team.Order ? [userProfile, botProfile] : [botProfile, userProfile]

    // Get perspectives
    const { match, id } = this.matchBank.createAndRegisterMatch({
      timelimit: HUMAN_VS_BOT_TIMELIMIT,
    })
    const { orderPerspective, chaosPerspective } = this.matchBank.createPerspectives({
      match,
      orderId: orderProfile.id,
      chaosId: chaosProfile.id,
    })

    // Get bot, passing perspective
    const bot = this.getBot(
      botConfig,
      humanTeam === Team.Order ? chaosPerspective : orderPerspective
    )

    // Sync
    this.subscribeMatchEvents(match, orderProfile, chaosProfile, true, new Date())

    // Start match
    match.start()
    bot.start()
    return Ok(id)
  }

  /**
   * Creates a bot vs bot match for testing and balancing purposes.
   */
  async createBotVsBotMatch(name1: BotName, name2: BotName) {
    // Get bot configs
    const [config1, config2] = await Promise.all([
      this.configRepository.getBotConfig(name1),
      this.configRepository.getBotConfig(name2),
    ])
    if (!config1 || !config2) throw new Error('Could not find bot config(s).')

    // Get bot profiles
    const [profile1, profile2] = await Promise.all([
      this.getProfile(config1.uid),
      this.getProfile(config2.uid),
    ])
    if (!profile1 || !profile2) throw new Error('Could not find bot profile(s).')

    // Coinflip profiles
    const sideOfFirst = <Team>Math.round(Math.random())
    const [orderProfile, chaosProfile] =
      sideOfFirst === Team.Order ? [profile1, profile2] : [profile2, profile1]

    // Create and register match
    const { match } = this.matchBank.createAndRegisterMatch({
      timelimit: 60 * 1000,
    })

    // Create perspectives
    const { orderPerspective, chaosPerspective } = await this.matchBank.createPerspectives({
      match,
      orderId: config1.uid,
      chaosId: config2.uid,
    })

    // Get bots, passing perspectives
    const order = this.getBot(config1, orderPerspective)
    const chaos = this.getBot(config2, chaosPerspective)

    // Sync
    this.subscribeMatchEvents(match, orderProfile, chaosProfile, true, new Date())

    // Start match and bots
    match.start()

    order.start()
    chaos.start()
    return match
  }

  /**
   * Create a new Player vs Player match.
   */
  async createPvPMatch(userId1: string, userId2: string) {
    // Get profiles
    const [profile1, profile2] = await Promise.all([
      this.getProfile(userId1),
      this.getProfile(userId2),
    ])
    if (!profile1 || !profile2) panic('Could not find user profiles for PvP match.')

    // Coinflips sides
    const sideOfFirst = <Team>Math.round(Math.random())
    const [orderProfile, chaosProfile] =
      sideOfFirst === Team.Order ? [profile1, profile2] : [profile2, profile1]

    // Create and register a match in match bank
    const { match, id } = this.matchBank.createAndRegisterMatch({
      timelimit: HUMAN_VS_HUMAN_TIMELIMIT,
    })

    // Register perspectives for both players in match bank
    this.matchBank.createPerspectives({
      match,
      orderId: orderProfile.id,
      chaosId: chaosProfile.id,
    })

    // Sync
    this.subscribeMatchEvents(match, orderProfile, chaosProfile, true, new Date())

    // Start match
    match.start()
    return id
  }

  /**
   * Returns the oponent user id for a given user id.
   */
  getOpponent(userId: string): string {
    return this.matchBank.getOpponent(userId)
  }

  /**
   * Checks if a user is available to join a match (not currently in a match). Used by the queue service.
   */
  isAvailable(userId: string) {
    return !this.matchBank.containsUser(userId)
  }

  async getMatchByRow(match: GetResult<MatchRow>): Promise<GetMatchResult> {
    return {
      events: match.data.events,
      id: match.id,
      order: match.data[Team.Order],
      chaos: match.data[Team.Chaos],
      winner: match.data.winner,
      date: match.data.timestamp,
    }
  }

  async getListedMatchByRow(match: GetResult<MatchRow>): Promise<ListMatchesResultItem> {
    return {
      events: match.data.events,
      id: match.id,
      order: match.data[Team.Order],
      chaos: match.data[Team.Chaos],
      winner: match.data.winner,
      date: match.data.timestamp,
    }
  }

  /**
   * Listens to match class events and re-emits them as application events so that other services can listen to them.
   */
  private subscribeMatchEvents(
    match: Match,
    order: GetResult<UserRow>,
    chaos: GetResult<UserRow>,
    ranked: boolean,
    startedAt: Date
  ) {
    // Subscribe to any events that can change the state of the game and send state reports via websockets.
    match.onMany(
      [
        MatchClassEventType.Choice,
        MatchClassEventType.Surrender,
        MatchClassEventType.Timeout,
        MatchClassEventType.Finish,
      ],
      () => {
        const stateReport = match.stateReport
        for (const player of [order, chaos]) {
          // Validate that the player is not a bot
          if (player.data.role !== 'bot') {
            this.matchSocketsService.send(player.id, MatchServerEvents.StateReport, stateReport)
          }
        }
      }
    )

    match.on(MatchClassEventType.Finish, () => {})

    // Subscribe to match finished event
    match.on(MatchClassEventType.Finish, async (summary) => {
      const orderScore = computeOrderScore(summary)

      // FIXME: Avoid computing ratings if not ranked.
      const newRatings = await this.ratingService.getNewRatings({
        first: {
          rating: order.data.elo.score,
          k: order.data.elo.k,
          challenger: order.data.elo.challenger,
        },
        second: {
          rating: chaos.data.elo.score,
          k: chaos.data.elo.k,
          challenger: chaos.data.elo.challenger,
        },
        scoreOfFirst: orderScore,
      })

      const finishEvent: MatchFinishedEvent = {
        order: {
          id: order.id,
          matchScore: orderScore,
          row: order,
          time: summary.order.timeSpent,
          newRating: {
            k: newRatings.first.k,
            score: newRatings.first.rating,
            matches: order.data.elo.matches + 1,
            challenger: newRatings.first.challenger,
          },
        },
        chaos: {
          id: chaos.id,
          row: chaos,
          matchScore: 1 - orderScore,
          time: summary.chaos.timeSpent,
          newRating: {
            k: newRatings.second.k,
            score: newRatings.second.rating,
            matches: chaos.data.elo.matches + 1,
            challenger: newRatings.second.challenger,
          },
        },
        events: match.events,
        ranked,
        startedAt,
      }

      this.eventEmitter.emit('match.finished', finishEvent)
    })

    function computeOrderScore(summary: MatchClassSummary): number {
      if (summary.winner === Team.Order) return 1
      if (summary.winner === Team.Chaos) return 0
      return summary.chaos.timeSpent / (summary.order.timeSpent + summary.chaos.timeSpent || 1)
    }
  }

  private getBot(botConfig: BotConfig, perspective: Perspective): BaseBot {
    return botConfig.model === 'lmm'
      ? new LmmBot(perspective, botConfig.depth)
      : new RandomBot(perspective)
  }

  private async getProfile(userId: string): Promise<GetResult<UserRow> | null> {
    const profile = await this.userRepository.getById(userId)
    return profile
  }
}
