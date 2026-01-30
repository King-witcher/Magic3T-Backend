import { Catch, ExceptionFilter } from '@nestjs/common'
import { ThrottlerException } from '@nestjs/throttler'
import { respondError } from '../errors'

/**
 * Handles ThrottlerException and sends appropriate responses based on the context (HTTP, WebSocket, RPC).
 * @see ThrottlerException
 */
@Catch(ThrottlerException)
export class ThrottlingFilter implements ExceptionFilter {
  catch() {
    respondError('too-many-requests', 429)
  }
}
