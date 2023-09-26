import { Injectable } from '@nestjs/common'
import { Match } from './models/Match'

@Injectable()
export class MatchService {
  matches: Record<string, Match> = {}

  createMatch() {
    const match = new Match()
    return (this.matches[match.id] = match)
  }

  getMatch(id: string) {
    return this.matches[id] || null
  }

  getPlayer(matchId: string, playerKey: string) {}
}
