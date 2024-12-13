import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { BaseError } from '../errors/base-error'
import { Socket } from 'socket.io'

@Catch(BaseError)
export class WsFilter implements ExceptionFilter {
  catch(exception: BaseError, argumentsHost: ArgumentsHost) {
    const client = argumentsHost.switchToWs().getClient<Socket>()
    client.emit('error', { status: 'error', error: exception.message })
  }
}
