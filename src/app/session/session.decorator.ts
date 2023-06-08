import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { SessionData } from './session.types'

export const Session = createParamDecorator<
  unknown,
  ExecutionContext,
  SessionData
>((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.session
})
