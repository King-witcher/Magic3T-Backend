import { Team } from '@/database'
import { Choice } from '@/types/Choice'
import { NotImplementedException } from '@nestjs/common'
import { Observable } from 'rxjs'
import { StateReportData } from '../types'
import { Match, MatchEventsMap } from './match'

/**
 * A perspective is a portal through which a player (human or bot) can interact with its ongoing match.
 */
export class Perspective extends Observable<MatchEventsMap> {
  constructor(
    public readonly match: Match,
    public readonly team: Team
  ) {
    super()
  }

  getStateReport(): StateReportData {
    return this.match.stateReport
  }

  pick(choice: Choice) {
    this.match.handleChoice(this.team, choice)
  }

  forfeit() {
    throw new NotImplementedException()
  }

  observe<Event extends keyof MatchEventsMap>(
    event: Event,
    observer: (...data: Parameters<MatchEventsMap[Event]>) => void
  ) {
    this.match.observe(event, observer)
  }
}
