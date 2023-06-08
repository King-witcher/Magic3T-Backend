import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { Profile } from 'src/entities/Profile'

export const Session = createParamDecorator<unknown, ExecutionContext, Profile>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.profile
  }
)
