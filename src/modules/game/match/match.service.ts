import { Inject, Injectable } from '@nestjs/common'
import { Match } from './models/Match'
import { PlayerData } from '../queue/models/PlayerData'
import { MatchConfig } from './models/MatchConfig'

@Injectable()
export class MatchService {
  constructor(
    @Inject('GAME_MODE_CONFIG') private readonly gameModeConfig: GameModeConfig
  ) {}
  matches: Record<string, Match> = {}

  createMatch(
    firstPlayer: PlayerData,
    secondPlayer: PlayerData,
    config: MatchConfig
  ) {
    const match = new Match({
      firstPlayer,
      secondPlayer,
      config,
    })
    return (this.matches[match.id] = match)
  }

  getMatch(id: string) {
    return this.matches[id] || null
  }
}
