import { AuthSocket } from '@/auth/auth-socket'
import { SocketsService } from '@/common'
import {
  CallHandler,
  ExecutionContext,
  Inject,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { QueueEmitType } from './types'

/// Adds authenticated connections to the QueueSocketsService.
export class QueueInterceptor implements NestInterceptor {
  constructor(
    @Inject('QueueSocketsService')
    private queueSocketsService: SocketsService<QueueEmitType>
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
