import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { Panic } from '@/common/utils/rust/panic'

@Catch(Panic)
export class PanicFilter implements ExceptionFilter {
  catch(panic: Panic, argumentsHost: ArgumentsHost) {
    const context = argumentsHost.getType()
    switch (context) {
      case 'ws': {
        const client = argumentsHost.switchToWs().getClient()
        const error = Err('server panicked')
        client.emit('error', error.serialize())
        return
      }
      case 'http': {
        const ctx = argumentsHost.switchToHttp()
        const response = ctx.getResponse()
        response.status(500).json(Err('server panicked'))
        break
      }
      case 'rpc': {
        throw panic
      }
    }
  }
}
