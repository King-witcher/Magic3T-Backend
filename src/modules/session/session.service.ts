import {
  ExecutionContext,
  Injectable,
  createParamDecorator,
} from '@nestjs/common'
import { Session, SessionMap } from './types'
import { v4 } from 'uuid'
import { ProfileService } from '../profile/profile.service'
import { Profile } from 'src/entities/Profile'
import { Request } from 'express'

@Injectable()
export class SessionService {
  constructor(public profileService: ProfileService) {
    setInterval(() => {
      const time = Date.now()
      const tokens = Object.keys(this.sessions)
      tokens.forEach((token) => {
        if (this.sessions[token].expires < time) delete this.sessions[token]
      })
    }, 1000 * 60 * 60)
  }

  private sessions: SessionMap = {}

  Session = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const ssid = request.headers['Magic3t-Session']
    if (typeof ssid === 'string') {
      return this.sessions[ssid] || null
    }
    return null
  })

  createSession(profile: Profile) {
    const ssid = 'SSID' + v4()

    const session: Session = {
      ssid: ssid,
      expires: Infinity,
      profile: {
        nickname: profile.nickname,
        rating: profile.rating,
      },
    }
    this.sessions[ssid] = session
    return ssid
  }

  getProfile(sessionId: string) {
    const session = this.sessions[sessionId]
    if (session) return session.profile
    else return null
  }

  getSession(request: Request) {
    const ssid = request.headers['Magic3t-Session'] || ''
    if (ssid instanceof Array) {
      return this.sessions[ssid[0]] || null
    } else return this.sessions[ssid] || null
  }
}
