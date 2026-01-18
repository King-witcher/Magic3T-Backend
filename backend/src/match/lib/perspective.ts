import { AssignmentsPayload, StateReportPayload } from '@magic3t/api-types'
import { Choice, Team } from '@magic3t/common-types'
import { Result } from '@/common'
import { Match, MatchClassError, MatchClassEventsMap } from './match'

export type PerspectiveParams = {
  match: Match
  team: Team
  teams: {
    order: string
    chaos: string
  }
}

/**
 * A perspective is a portal through which a player (human or bot) can interact with its ongoing match.
 */
export class Perspective {
  private readonly match: Match
  public readonly team: Team
  private readonly teamIds: {
    order: string
    chaos: string
  }

  constructor({ match, team, teams }: PerspectiveParams) {
    this.match = match
    this.team = team
    this.teamIds = teams
  }

  async getAssignments(): Promise<AssignmentsPayload> {
    return {
      [Team.Order]: {
        profile: {
          id: this.teamIds.order,
        },
      },
      [Team.Chaos]: {
        profile: {
          id: this.teamIds.chaos,
        },
      },
    }
  }

  getStateReport(): StateReportPayload {
    return this.match.stateReport
  }

  pick(choice: Choice): Result<[], MatchClassError> {
    return this.match.handleChoice(this.team, choice)
  }

  surrender(): Result<[], MatchClassError> {
    return this.match.handleSurrender(this.team)
  }

  on<Event extends keyof MatchClassEventsMap>(
    event: Event,
    observer: (...data: Parameters<MatchClassEventsMap[Event]>) => void
  ) {
    this.match.on(event, observer)
  }
}
