import { Inject, Injectable } from '@nestjs/common'
import { Match, MatchParams } from './models/Match'
import { PlayerData } from '../queue/models/PlayerData'
import { MatchConfig } from './models/MatchConfig'

@Injectable()
export class MatchService {
  constructor(
    @Inject('GAME_MODE_CONFIG') private readonly gameModeConfig: GameModeConfig
  ) {}
  matches: Record<string, Match> = {}

  createMatch(params: MatchParams) {
    const match = new Match(params)
    return (this.matches[match.id] = match)
  }

  getMatch(id: string) {
    return this.matches[id] || null
  }
}
