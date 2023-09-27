import { JwtPayload } from '@/modules/auth/models/JwtPayload'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AbstractStrategy } from '@nestjs/passport'
import { Socket } from 'socket.io'

@Injectable()
export class JwtStrategy implements AbstractStrategy {
  constructor(private readonly jwtService: JwtService) {}

  validate(socket: Socket) {
    const token = socket.handshake.auth.jwt
    try {
      const data = this.jwtService.verify<JwtPayload>(token)
      socket.data.profileId = data.profileId
      return true
    } catch {
      return false
    }
  }
}
