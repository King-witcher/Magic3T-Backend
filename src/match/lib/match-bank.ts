import { DatabaseService, SidesEnum } from '@/database'
import { MatchSideAdapter } from '../types'
import { Match, MatchEventsEnum } from './match'
import { BaseError } from '@/common/errors/base-error'
import { HttpStatus, Injectable } from '@nestjs/common'

@Injectable()
/// Maps all matches that are currently running on the server.
export class MatchBank {
  private matches: Map<string, Match> = new Map() // Maps matchIds to matches
  private adapters: Map<string, MatchSideAdapter> = new Map() // Maps user ids to matchAdapters
  private opponents: Map<string, string> = new Map()

  constructor(private readonly databaseService: DatabaseService) {}

  /// Creates a match that will be assigned to an id until it's finished.
  createAndRegisterMatch(...params: ConstructorParameters<typeof Match>): {
    id: string
    match: Match
  } {
    // Get the match id as defined by the database service
    const id = this.databaseService.getId()

    // Create and assign the match in the bank
    const match = new Match(...params)
    this.matches.set(id, match)

    // Remove the match from the bank when finished
    match.observe(MatchEventsEnum.Finish, () => {
      this.matches.delete(id)
    })

    return {
      match,
      id,
    }
  }

  /// Creates instances of MatchSideAdapters for two different user ids and stores this relation in the bank.
  assignAdapters(
    match: Match,
    [userId1, userId2]: [string, string],
    sideOfFirst: SidesEnum,
  ): [MatchSideAdapter, MatchSideAdapter] {
    // Get adapters
    const adapter1 = match.getAdapter(sideOfFirst)
    const adapter2 = match.getAdapter(1 - sideOfFirst)

    // Store relations the bank
    this.adapters.set(userId1, adapter1)
    this.adapters.set(userId2, adapter2)
    this.opponents.set(userId1, userId2)
    this.opponents.set(userId2, userId1)

    // Remove from bank when match finishes
    match.observe(MatchEventsEnum.Finish, () => {
      this.adapters.delete(userId1)
      this.adapters.delete(userId2)
      this.opponents.delete(userId1)
      this.opponents.delete(userId2)
    })

    return [adapter1, adapter2]
  }

  getMatch(matchId: string): Match {
    const match = this.matches.get(matchId)
    if (!match) throw new BaseError('match not found', HttpStatus.NOT_FOUND)
    return match
  }

  getOpponent(uid: string): string {
    const opponentUid = this.opponents.get(uid)
    if (!opponentUid) throw new Error(`bad uid ${uid}.`)
    return opponentUid
  }

  getAdapter(userId: string): MatchSideAdapter | null {
    const adapter = this.adapters.get(userId)
    return adapter || null
  }

  /// Gets if a user is currently in a match.
  containsUser(userId: string): boolean {
    return this.adapters.has(userId)
  }
}
