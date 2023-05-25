import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { createHash } from 'node:crypto'

export const IsDebug = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const secret = request.cookies?.debugSecret
    if (secret) {
      const hash = createHash('sha256').update(secret).digest('hex')
      console.log(hash, process.env.DEBUG_SECRET_HASH)
      return hash === process.env.DEBUG_SECRET_HASH
    }
    return false
  }
)
