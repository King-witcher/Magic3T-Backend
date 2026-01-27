import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common'
import { UnexpectedError } from '../errors'

@Catch()
export class UnexpectedErrorFilter implements ExceptionFilter {
  logger = new Logger(UnexpectedErrorFilter.name, { timestamp: true })

  async catch(error: Error, argumentsHost: ArgumentsHost) {
    const context = argumentsHost.getType()

    if (error instanceof UnexpectedError) {
      this.logger.error(`UnexpectedError caught: ${error.message}`)
    } else {
      this.logger.error(`Unknown error caught: ${error.message}`)
    }
    console.error(error)

    switch (context) {
      case 'ws': {
        const client = argumentsHost.switchToWs().getClient()
        client.emit('error', {
          errorCode: 'internal-server-error',
          description: 'An unexpected error occurred on the server.',
        })
        return
      }
      case 'http': {
        const ctx = argumentsHost.switchToHttp()
        const response = ctx.getResponse()
        response.status(500).json({
          errorCode: 'internal-server-error',
          description: 'An unexpected error occurred on the server.',
        })
        break
      }
      case 'rpc': {
        console.error('RPC ResponseError:', error)
      }
    }
  }
}
