import { Global, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { QueueModule } from '@modules/queue/queue.module'

@Global()
@Module({
  imports: [QueueModule],
  controllers: [AppController],
})
export class AppModule {}
