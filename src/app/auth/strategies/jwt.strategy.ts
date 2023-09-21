import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserFromJwt } from '../models/UserFromJwt'
import { JwtPayload } from '../models/JwtPayload'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: JwtPayload): Promise<UserFromJwt> {
    return {
      registryId: payload.registryId,
      profileId: payload.profileId,
      email: payload.email,
      nickname: payload.nickname,
    }
  }
}
