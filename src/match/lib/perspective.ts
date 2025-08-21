import { Result } from '@/common'
import { UserDto } from '@/database'
import { RatingService } from '@/rating'
import {
  AssignmentsPayload,
  Choice,
  StateReportPayload,
  Team,
} from '@magic3t/types'
import { Match, MatchError, MatchEventsMap } from './match'

/**
 * A perspective is a portal through which a player (human or bot) can interact with its ongoing match.
 */
export class Perspective {
  constructor(
    public readonly match: Match,
    public readonly team: Team,
    public readonly ratingService: RatingService
  ) {}

  async getAssignments(): Promise<AssignmentsPayload> {
    const order = this.match.assignments[Team.Order]
    const chaos = this.match.assignments[Team.Chaos]

    return {
      [Team.Order]: {
        profile: await UserDto.fromModel(order, this.ratingService),
      },
      [Team.Chaos]: {
        profile: await UserDto.fromModel(chaos, this.ratingService),
      },
    }
  }

  getStateReport(): StateReportPayload {
    return this.match.stateReport
  }

  pick(choice: Choice): Result<[], MatchError> {
    return this.match.handleChoice(this.team, choice)
  }

  surrender(): Result<[], MatchError> {
    return this.match.handleSurrender(this.team)
  }

  on<Event extends keyof MatchEventsMap>(
    event: Event,
    observer: (...data: Parameters<MatchEventsMap[Event]>) => void
  ) {
    this.match.on(event, observer)
  }
}
