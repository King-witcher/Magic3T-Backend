import { Player } from './Player'

export enum EventType {
  MatchBegins = 'match begins',
  Choice = 'choice',
  Timeout = 'timeout',
}

export class GameEvent {
  timeStamp: number
  targetPlayer?: Player
  value?: any

  constructor(public event: EventType) {
    this.timeStamp = Date.now()
  }
}
