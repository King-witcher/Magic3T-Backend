import { JwtPayload } from '@/modules/auth/models/JwtPayload'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Socket } from 'socket.io'

@Injectable()
export class QueueGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext) {
    const socket = context.switchToWs().getClient<Socket>()
    const token = socket.handshake.auth.jwt
    try {
      this.jwtService.verify<JwtPayload>(token)
      return true
    } catch {
      return false
    }
  }
}
