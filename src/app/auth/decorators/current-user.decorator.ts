import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { LocalAuthRequest } from '../models/AuthRequest'
import { Profile } from '@/models/Profile'
import { UserFromJwt } from '../models/UserFromJwt'
import { JwtRequest } from '../models/JwtRequest'

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserFromJwt => {
    const request = context.switchToHttp().getRequest<JwtRequest>()

    return request.user
  }
)
