import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'
import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { CurrentPerspective } from './decorators'
import { MatchBank, Perspective } from './lib'
import { MatchGuard } from './match.guard'

@UseGuards(AuthGuard)
@Controller('match')
export class MatchController {
  constructor(private matchBank: MatchBank) {}

  @ApiOperation({
    summary: 'Forfeit',
    description: 'Forfeit the current match',
  })
  @Post(':matchId/forfeit')
  @HttpCode(200)
  @UseGuards(MatchGuard)
  handleForfeit(@CurrentPerspective() matchAdapter: Perspective) {
    matchAdapter.surrender()
  }

  @ApiOperation({
    summary: 'Get state',
    description: 'Get the state of the current match',
  })
  @Get('state')
  getState() {
    return 1
  }

  @Get('current')
  handleCurrentMatch(@UserId() userId: string) {
    const perspective = this.matchBank.getPerspective(userId)
    if (!perspective) throw new NotFoundException()
    return {
      id: perspective.match.id,
    }
  }
}
