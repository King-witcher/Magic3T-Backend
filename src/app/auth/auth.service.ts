import { Injectable } from '@nestjs/common'
import { RegistryService } from '../registry/registry.service'
import { Registry } from '@/models/Registry'
import { JwtService } from '@nestjs/jwt'
import { UserPayload } from './models/UserPayload'
import { UserToken } from './models/UserToken'

@Injectable()
export class AuthService {
  constructor(
    private readonly registryService: RegistryService,
    private readonly jwtService: JwtService
  ) {}

  login(user: Registry): UserToken {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      name: user.profile.nickname,
      username: user.username,
    }

    const jwt = this.jwtService.sign(payload)
    return {
      access_token: jwt,
    }
  }

  async validateUser(username: string, password: string) {
    const user = await this.registryService.findByUsername(username)
    if (user) {
      if (user.checkPassword(password))
        return {
          ...user,
          password: undefined,
        }
    }

    throw new Error()
  }
}
