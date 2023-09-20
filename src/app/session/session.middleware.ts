import { Injectable, NestMiddleware } from '@nestjs/common'
import { SessionService } from './session.service'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private sessionService: SessionService) {}

  use(req: Request, res: Response, next: NextFunction) {
    let ssid = req.headers['magic3t-session']
    if (!ssid) return next()
    if (ssid instanceof Array) {
      ssid = ssid[0]
    }
    const session = this.sessionService.getSession(ssid)
    req.session = session

    if (req.headers) next()
  }
}
