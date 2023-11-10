import { Injectable } from '@nestjs/common'
import { Match, MatchParams } from './lib/Match'

@Injectable()
export class MatchService {
  matches: Record<string, Match> = {}
  playerMatchMap: Record<string, Match> = {}

  createMatch(params: MatchParams) {
    const match = new Match(params)
    match.subscribe('onFinish', () => {
      delete this.matches[match.id]
      delete this.playerMatchMap[match.black.profile.uid]
      delete this.playerMatchMap[match.white.profile.uid]
    })
    this.playerMatchMap[params.black.uid] = match
    this.playerMatchMap[params.white.uid] = match
    return (this.matches[match.id] = match)
  }

  deleteMatch(id: string) {
    const match = this.getMatch(id)
    if (!match) throw new Error('Match not found')

    delete this.playerMatchMap[match.black.profile.uid]
    delete this.playerMatchMap[match.white.profile.uid]
    delete this.matches[id]
  }

  isAvailable(uid: string) {
    return !this.playerMatchMap[uid]
  }

  getMatch(id: string) {
    return this.matches[id] || null
  }
}
