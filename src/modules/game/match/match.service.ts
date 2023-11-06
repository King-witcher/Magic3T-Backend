import { Injectable } from '@nestjs/common'
import { Match, MatchParams } from './lib/Match'

@Injectable()
export class MatchService {
  matches: Record<string, Match> = {}

  createMatch(params: MatchParams) {
    const match = new Match(params)
    return (this.matches[match.id] = match)
  }

  getMatch(id: string) {
    return this.matches[id] || null
  }
}
