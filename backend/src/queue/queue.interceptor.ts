import { QueueServerEventsMap } from '@magic3t/api-types'
import { CallHandler, ExecutionContext, Inject, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { AuthSocket } from '@/auth/auth-socket'
import { SocketsService } from '@/common'

/// Adds authenticated connections to the QueueSocketsService.
export class QueueInterceptor implements NestInterceptor {
  constructor(
    @Inject('QueueSocketsService')
    private queueSocketsService: SocketsService<QueueServerEventsMap>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'ws')
      throw new Error('QueueInterceptor cannot be used outside Gateways')

    const socket = context.switchToWs().getClient<AuthSocket>()
    const userId = socket.data.userId
    if (!userId) throw new Error('socket is not authenticated')

    this.queueSocketsService.add(userId, socket)

    return next.handle()
  }
}
