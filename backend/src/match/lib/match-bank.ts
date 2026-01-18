import { Team } from '@magic3t/common-types'
import { Injectable } from '@nestjs/common'
import { DatabaseService } from '@/database'
import { RatingService } from '@/rating'
import { Match, MatchClassEventType } from './match'
import { Perspective } from './perspective'

@Injectable()
/// Maps all matches that are currently running on the server.
export class MatchBank {
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
    const id = this.databaseService.getTemporalId()

    // Create and assign the match in the bank
    const match = new Match(...params)
    match.id = id

    return {
      match,
      id,
    }
  }

  /// Creates instances of Perspective for two different user ids and stores this relation in the bank.
  createPerspectives(
    match: Match,
    [playerId1, playerId2]: [string, string],
    teamOfFirst: Team
  ): [Perspective, Perspective] {
    // Get perspectives
    const perspective1 = new Perspective({
      match,
      team: teamOfFirst,
      teams: {
        order: teamOfFirst === Team.Order ? playerId1 : playerId2,
        chaos: teamOfFirst === Team.Chaos ? playerId1 : playerId2,
      },
    })
    const perspective2 = new Perspective({
      match,
      team: teamOfFirst === Team.Order ? Team.Chaos : Team.Order,
      teams: {
        order: teamOfFirst === Team.Order ? playerId1 : playerId2,
        chaos: teamOfFirst === Team.Chaos ? playerId1 : playerId2,
      },
    })

    // Create relations in the bank
    this.perspectives.set(playerId1, perspective1)
    this.perspectives.set(playerId2, perspective2)
    this.opponents.set(playerId1, playerId2)
    this.opponents.set(playerId2, playerId1)

    // Remove from bank when match finishes
    match.on(MatchClassEventType.Finish, () => {
      this.perspectives.delete(playerId1)
      this.perspectives.delete(playerId2)
      this.opponents.delete(playerId1)
      this.opponents.delete(playerId2)
    })

    return [perspective1, perspective2]
  }

  getOpponent(userId: string): string {
    const opponentUid = this.opponents.get(userId)
    if (!opponentUid) throw new Error(`bad uid ${userId}.`)
    return opponentUid
  }

  getPerspective(userId: string): Perspective | null {
    const perspective = this.perspectives.get(userId)
    return perspective || null
  }

  /// Gets if a user is currently in a match.
  containsUser(id: string): boolean {
    return this.perspectives.has(id)
  }
}
