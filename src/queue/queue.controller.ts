import { Controller, Logger, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'

@Controller('queue')
@UseGuards(AuthGuard)
export class QueueController {
  private readonly logger = new Logger(QueueController.name, {
    timestamp: true,
  })

  @Post('ranked')
  handleRanked(@UserId() userId: string) {
    return userId
  }
}
