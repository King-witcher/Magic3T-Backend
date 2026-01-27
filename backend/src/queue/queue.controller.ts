import { BotName } from '@magic3t/types'
import { Body, Controller, Delete, NotImplementedException, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'
import { EnqueueDto, QueueMode } from './dtos/enqueue-dto'
import { QueueService } from './queue.service'
import { respondError } from '@/common'

@Controller('queue')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class QueueController {
  // private readonly logger = new Logger(QueueController.name, {
  //   timestamp: true,
  // })

  constructor(private readonly queueService: QueueService) {}

  @ApiOperation({
    summary: 'Enqueue for a match',
  })
  @Post()
  async handleEnqueue(@UserId() userId: string, @Body() body: EnqueueDto) {
    switch (body.queueMode) {
      case QueueMode.Ranked:
        return this.queueService.enqueue(userId, 'ranked')
      case QueueMode.Casual:
        respondError('not-implemented', 501, 'Casual mode is not implemented.')
      case QueueMode.Bot0:
        return await this.queueService.createBotMatch(userId, BotName.Bot0)
      case QueueMode.Bot1:
        return await this.queueService.createBotMatch(userId, BotName.Bot1)
      case QueueMode.Bot2:
        return await this.queueService.createBotMatch(userId, BotName.Bot2)
      case QueueMode.Bot3:
        return await this.queueService.createBotMatch(userId, BotName.Bot3)
    }
  }

  @ApiOperation({
    summary: 'Leave the queue',
    description: 'Stop searching for matches.',
  })
  @Delete('/')
  handleDequeueCasual(@UserId() userId: string) {
    this.queueService.dequeue(userId, 'casual')
    this.queueService.dequeue(userId, 'ranked')
  }
}
