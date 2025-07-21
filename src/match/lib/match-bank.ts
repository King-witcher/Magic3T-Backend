import { BaseError } from '@/common/errors/base-error'
import { DatabaseService } from '@/database'
import { RatingService } from '@/rating'
import { HttpStatus, Injectable } from '@nestjs/common'
import { Match, MatchEventType } from './match'
import { Perspective } from './perspective'
import { Team } from '@magic3t/types'

@Injectable()
/// Maps all matches that are currently running on the server.
export class MatchBank {
  private matches: Map<string, Match> = new Map() // Maps matchIds to matches
  private perspectives: Map<string, Perspective> = new Map() // Maps user ids to matchAdapters
  private opponents: Map<string, string> = new Map()

  constructor(
    private databaseService: DatabaseService,
    private ratingService: RatingService
  ) {}

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
    match.observe(MatchEventType.Finish, () => {
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
    [player1, player2]: [string, string],
    teamOfFirst: Team
  ): [Perspective, Perspective] {
    // Get perspectives
    const perspective1 = new Perspective(match, teamOfFirst, this.ratingService)
    const perspective2 = new Perspective(
      match,
      1 - teamOfFirst,
      this.ratingService
    )

    // Create relations in the bank
    this.perspectives.set(player1, perspective1)
    this.perspectives.set(player2, perspective2)
    this.opponents.set(player1, player2)
    this.opponents.set(player2, player1)

    // Remove from bank when match finishes
    match.observe(MatchEventType.Finish, () => {
      this.perspectives.delete(player1)
      this.perspectives.delete(player2)
      this.opponents.delete(player1)
      this.opponents.delete(player2)
    })

    return [perspective1, perspective2]
  }

  getMatch(id: string): Match {
    const match = this.matches.get(id)
    if (!match) throw new BaseError('match not found', HttpStatus.NOT_FOUND)
    return match
  }

  getOpponent(user: string): string {
    const opponentUid = this.opponents.get(user)
    if (!opponentUid) throw new Error(`bad uid ${user}.`)
    return opponentUid
  }

  getPerspective(user: string): Perspective | null {
    const perspective = this.perspectives.get(user)
    return perspective || null
  }

  /// Gets if a user is currently in a match.
  containsUser(id: string): boolean {
    return this.perspectives.has(id)
  }
}
