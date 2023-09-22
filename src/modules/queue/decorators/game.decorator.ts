import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Socket } from 'socket.io'

export const CurrentGame = createParamDecorator(
  (data: unknown, context: ExecutionContext): any => {
    const socket = context.switchToHttp().getRequest<Socket>()
    console.log(socket.id)
    return socket
  }
)
