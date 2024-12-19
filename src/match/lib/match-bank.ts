import { BaseError } from '@/common/errors/base-error'
import { DatabaseService, SidesEnum } from '@/database'
import { HttpStatus, Injectable } from '@nestjs/common'
import { Perspective } from '../types'
import { Match, MatchEventsEnum } from './match'

@Injectable()
/// Maps all matches that are currently running on the server.
export class MatchBank {
  private matches: Map<string, Match> = new Map() // Maps matchIds to matches
  private perspectives: Map<string, Perspective> = new Map() // Maps user ids to matchAdapters
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
    match.id = id
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

  /// Creates instances of Perspective for two different user ids and stores this relation in the bank.
  createPerspectives(
    match: Match,
    [userId1, userId2]: [string, string],
    sideOfFirst: SidesEnum
  ): [Perspective, Perspective] {
    // Get perspectives
    const perspective1 = match.getAdapter(sideOfFirst)
    const perspective2 = match.getAdapter(1 - sideOfFirst)

    // Store relations the bank
    this.perspectives.set(userId1, perspective1)
    this.perspectives.set(userId2, perspective2)
    this.opponents.set(userId1, userId2)
    this.opponents.set(userId2, userId1)

    // Remove from bank when match finishes
    match.observe(MatchEventsEnum.Finish, () => {
      this.perspectives.delete(userId1)
      this.perspectives.delete(userId2)
      this.opponents.delete(userId1)
      this.opponents.delete(userId2)
    })

    return [perspective1, perspective2]
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

  getPerspective(userId: string): Perspective | null {
    const perspective = this.perspectives.get(userId)
    return perspective || null
  }

  /// Gets if a user is currently in a match.
  containsUser(userId: string): boolean {
    return this.perspectives.has(userId)
  }
}
