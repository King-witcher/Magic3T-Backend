import { Global, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { QueueModule } from './modules/queue/queue.module'
import { SocketsService } from './modules/sockets.service'

@Global()
@Module({
  imports: [QueueModule],
  providers: [SocketsService],
  exports: [SocketsService],
  controllers: [AppController],
})
export class AppModule {}
