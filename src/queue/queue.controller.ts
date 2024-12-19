import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'
import { BotName } from '@/database'
import { Controller, Delete, Logger, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger'
import { QueueService } from './queue.service'

@Controller('queue')
@ApiBearerAuth()
@ApiHeader({
  name: 'Authorization',
})
@UseGuards(AuthGuard)
export class QueueController {
  private readonly logger = new Logger(QueueController.name, {
    timestamp: true,
  })

  constructor(private readonly queueService: QueueService) {}

  @ApiOperation({
    summary: 'Play fair bot',
    description:
      'Find the fairest bot to play against. The algoritm will randomly choose between the closest bots, making your winrate as close to 50% as it can.',
  })
  @Post('fair')
  async handleFairBot(@UserId() userId: string) {
    await this.queueService.createFairBotMatch(userId)
  }

  @ApiOperation({
    summary: 'Play Bot-0',
    description: 'Instantly start a match against bot-0.',
  })
  @Post('bot-0')
  async handleBot0(@UserId() userId: string) {
    await this.queueService.createBotMatch(userId, BotName.Bot0)
  }

  @ApiOperation({
    summary: 'Play Bot-1',
    description: 'Instantly start a match against bot-1.',
  })
  @Post('bot-0')
  @Post('bot1')
  async handleBot1(@UserId() userId: string) {
    await this.queueService.createBotMatch(userId, BotName.Bot1)
  }

  @ApiOperation({
    summary: 'Play Bot-2',
    description: 'Instantly start a match against bot-2.',
  })
  @Post('bot-2')
  async handleBot2(@UserId() userId: string) {
    await this.queueService.createBotMatch(userId, BotName.Bot2)
  }

  @ApiOperation({
    summary: 'Play Bot-3',
    description: 'Instantly start a match against bot-3.',
  })
  @Post('bot-3')
  async handleBot3(@UserId() userId: string) {
    await this.queueService.createBotMatch(userId, BotName.Bot3)
  }

  @ApiOperation({
    summary: 'Enqueue casual',
    description: 'Search for a casual match.',
  })
  @Post('casual')
  handleCasual(@UserId() userId: string) {
    this.queueService.enqueue(userId, 'casual')
  }

  @ApiOperation({
    summary: 'Enqueue ranked',
    description: 'Search for a ranked match.',
  })
  @Post('ranked')
  handleRanked(@UserId() userId: string) {
    this.queueService.enqueue(userId, 'ranked')
  }

  @ApiOperation({
    summary: 'Dequeue casual',
    description: 'Stop searching for a casual match.',
  })
  @Delete('casual')
  handleDequeueCasual(@UserId() userId: string) {
    this.queueService.dequeue(userId, 'casual')
  }

  @ApiOperation({
    summary: 'Dequeue ranked',
    description: 'Stop searching for a ranked match.',
  })
  @Delete('ranked')
  handleDequeueRanked(@UserId() userId: string) {
    this.queueService.dequeue(userId, 'ranked')
  }
}
