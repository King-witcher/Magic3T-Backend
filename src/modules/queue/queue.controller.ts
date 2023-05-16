import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, NotImplementedException, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { EnqueueDto } from './dto/enqueue.dto'
import { QueueMode, QueueService } from './queue.service'

@Controller('queue')
@UsePipes(new ValidationPipe())
export class QueueController {
  constructor(
    public queueService: QueueService,
  ) { }

  @Post('casual')
  async insert(@Body() { gameMode, sessionId }: EnqueueDto) {
    if (gameMode === 'casual') {
      const queueId = await this.queueService.insertToQueue(sessionId, QueueMode.Casual)
      return { queueId }
    }
  }

  @Post('ranked')
  async insertRanked() {
    throw new NotImplementedException()
  }

  @Get('casual/:queueId')
  async checkQueue(@Param('queueId') queueId: string) {
    const queueEntry = this.queueService.getEntryStatus(queueId, QueueMode.Casual)
    if (queueEntry) return queueEntry
    else throw new NotFoundException()
  }

  @Delete('casual/:queueId')
  @HttpCode(204)
  removeFromQueue(@Param('queueId') queueId: string) {
    this.queueService.removeFromQueue(queueId, QueueMode.Casual)
  }
}
