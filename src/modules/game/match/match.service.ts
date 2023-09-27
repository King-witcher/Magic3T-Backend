import { Inject, Injectable } from '@nestjs/common'
import { Match } from './models/Match'

@Injectable()
export class MatchService {
  constructor(
    @Inject('GAME_MODE_CONFIG') private readonly gameModeConfig: GameModeConfig
  ) {}
  matches: Record<string, Match> = {}

  createMatch() {
    const match = new Match({
      timelimit: this.gameModeConfig.timeLimit || 90,
    })
    return (this.matches[match.id] = match)
  }

  getMatch(id: string) {
    return this.matches[id] || null
  }
}
