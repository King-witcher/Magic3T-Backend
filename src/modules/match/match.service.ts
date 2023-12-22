import { Injectable } from '@nestjs/common'
import { Match, MatchParams } from './lib/Match'
import { GamePlayerProfile } from '../queue/types/GamePlayerProfile'
import { SocketsService } from '../sockets.service'
import { LMMBot } from '@/lib/bots/LMMBot'
import { models } from '@/firebase/models'
import { RandomBot } from '@/lib/bots/RandomBot'

@Injectable()
export class MatchService {
  matches: Record<string, Match> = {}
  playerMatchMap: Record<string, Match> = {}

  constructor(private socketsService: SocketsService) {}

  createMatch(params: MatchParams) {
    const match = new Match(params)
    match.subscribe('onFinish', () => {
      delete this.matches[match.id]
      delete this.playerMatchMap[match.black.profile.uid]
      delete this.playerMatchMap[match.white.profile.uid]
    })
    this.playerMatchMap[params.black.uid] = match
    this.playerMatchMap[params.white.uid] = match

    console.log(
      `Match created for "${match.white.profile.name}" vs "${match.black.profile.name}".`,
    )

    return (this.matches[match.id] = match)
  }

  async createWithRandom(
    player: GamePlayerProfile,
    timelimit: number,
    isRanked = false,
  ) {
    const { glicko, nickname, _id } = await models.users.getById('randombot')

    const botProfile = {
      glicko,
      name: nickname,
      uid: _id,
      isAnonymous: false,
    }

    const botSide = Math.random() < 0.5 ? 'white' : 'black'

    const match = this.createMatch({
      white: botSide === 'black' ? player : botProfile,
      black: botSide === 'black' ? botProfile : player,
      config: {
        isRanked,
        readyTimeout: 2000,
        timelimit,
      },
    })

    match[botSide].state.timer.setRemaining(10000)

    this.socketsService.emit(player.uid, 'matchFound', {
      matchId: match.id,
      oponentId: 'randombot',
    })

    const bot = new RandomBot(match[botSide])
    match[botSide].channel = bot.getChannel()
    match[botSide].onReady()
  }

  async createWithLMM(
    player: GamePlayerProfile,
    depth: 2 | 5 | 9,
    timelimit: number,
    isRanked = false,
  ) {
    try {
      const { glicko, nickname, _id } = await models.users.getById(
        `botlmm${depth}`,
      )

      const botProfile = {
        glicko,
        name: nickname,
        uid: _id,
        isAnonymous: false,
      }

      const botSide = Math.random() < 0.5 ? 'white' : 'black'

      const match = this.createMatch({
        white: botSide === 'black' ? player : botProfile,
        black: botSide === 'black' ? botProfile : player,
        config: {
          isRanked,
          readyTimeout: 2000,
          timelimit,
        },
      })

      match[botSide].state.timer.setRemaining(10000)

      this.socketsService.emit(player.uid, 'matchFound', {
        matchId: match.id,
        oponentId: `botlmm${depth}`,
      })

      const bot = new LMMBot(match[botSide], depth)
      match[botSide].channel = bot.getChannel()
      match[botSide].onReady()
    } catch (e) {
      console.error(e)
    }
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
