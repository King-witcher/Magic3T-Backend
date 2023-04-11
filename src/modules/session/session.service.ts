import { Injectable } from '@nestjs/common';
import { Session, SessionMap } from './types';
import { v4 } from 'uuid';

@Injectable()
export class SessionService {
  constructor() {
    setInterval(() => {
      const time = Date.now()
      const tokens = Object.keys(this.sessions)
      tokens.forEach(token => {
        if (this.sessions[token].expires < time)
          delete this.sessions[token]
      })
    }, 1000 * 60 * 60)
  }

  private sessions: SessionMap = {}

  createSession(userId: number) {
    const token = v4()
    const session: Session = {
      userId,
      token,
      expires: Infinity
    }
    this.sessions[token]
  }

  getUserIdFromToken(token: string): number | null {
    const session = this.sessions[token]
    if (session)
      return session.userId
    else
      return null
  }
}
