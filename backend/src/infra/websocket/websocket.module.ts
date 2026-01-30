import { Global, Module } from '@nestjs/common'
import { WebsocketEmitterService } from './websocket-emitter.service'

@Global()
@Module({
  providers: [WebsocketEmitterService],
  exports: [WebsocketEmitterService],
})
export class WebsocketModule {}
