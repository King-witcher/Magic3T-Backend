import { Controller, Delete, Logger, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'
import { QueueService } from './queue.service'
import { BotName } from '@/database'

@Controller('queue')
@UseGuards(AuthGuard)
export class QueueController {
  private readonly logger = new Logger(QueueController.name, {
    timestamp: true,
  })

  constructor(private readonly queueService: QueueService) {}

  @Post('fair')
  async handleFairBot(@UserId() userId: string) {
    await this.queueService.createFairBotMatch(userId)
  }

  @Post('bot-0')
  async handleBot0(@UserId() userId: string) {
    await this.queueService.createBotMatch(userId, BotName.Bot0)
  }

  @Post('bot1')
  async handleBot1(@UserId() userId: string) {
    await this.queueService.createBotMatch(userId, BotName.Bot1)
  }

  @Post('bot-2')
  async handleBot2(@UserId() userId: string) {
    await this.queueService.createBotMatch(userId, BotName.Bot2)
  }

  @Post('bot-3')
  async handleBot3(@UserId() userId: string) {
    await this.queueService.createBotMatch(userId, BotName.Bot3)
  }

  @Post('casual')
  handleCasual(@UserId() userId: string) {
    this.queueService.enqueue(userId, 'casual')
  }

  @Post('ranked')
  handleRanked(@UserId() userId: string) {
    this.queueService.enqueue(userId, 'ranked')
  }

  @Delete('casual')
  handleDequeueCasual(@UserId() userId: string) {
    this.queueService.dequeue(userId, 'casual')
  }

  @Delete('ranked')
  handleDequeueRanked(@UserId() userId: string) {
    this.queueService.dequeue(userId, 'ranked')
  }
}
