import { Controller, Logger, Post, UseGuards } from '@nestjs/common'
import { HttpQueueGuard } from './guards/http-queue.guard'
import { WsUserId } from './decorators'

@Controller('queue')
export class QueueController {
  private readonly logger = new Logger(QueueController.name, {
    timestamp: true,
  })

  @UseGuards(HttpQueueGuard)
  @Post('ranked')
  handleRanked(@WsUserId() userId: string) {
    return 1
  }
}
