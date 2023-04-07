import { Injectable } from '@nestjs/common'
import Session from './session'
import { v4 } from 'uuid'

const SESSION_DURATION = 1000 * 60 * 60

@Injectable()
export class SessionService {
  sessions: { [token: string]: Session } = {}
    
  createSession(userId: string): string {
    const token = v4()
    console.log(token)
    
    this.sessions[token] = {
      userId,
      token,
      expires: Date.now() + SESSION_DURATION
    }
    return token
  }

  getSessionByToken(token: string): Session | null {
    return this.sessions[token] || null
  }
}
