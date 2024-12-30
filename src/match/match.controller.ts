import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'
import { BotName } from '@/database'
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
import { MatchBank, MatchEventsEnum, Perspective } from './lib'
import { MatchGuard } from './match.guard'
import { MatchService } from './match.service'

@UseGuards(AuthGuard)
@Controller('match')
export class MatchController {
  constructor(
    private matchBank: MatchBank,
    matchService: MatchService
  ) {
    const names = Object.values(BotName)

    function shuffle() {
      let currentIndex = names.length

      while (currentIndex) {
        const randomIndex = Math.floor(Math.random() * currentIndex--)
        const temp = names[randomIndex]
        names[randomIndex] = names[currentIndex]
        names[currentIndex] = temp
      }
    }

    async function createRandomCvC() {
      shuffle()
      const [match1, match2] = await Promise.all([
        matchService.createCvCMatch(names[0], names[1]),
        matchService.createCvCMatch(names[2], names[3]),
      ])
      let terminated = 0
      return new Promise<void>((res) => {
        match1.observe(MatchEventsEnum.Finish, () => {
          if (++terminated === 2) res()
        })
        match2.observe(MatchEventsEnum.Finish, () => {
          if (++terminated === 2) res()
        })
      })
    }

    async function iter(count: number) {
      for (let i = 0; i < count; i++) {
        console.log(`iteration ${i + 1}`)
        await createRandomCvC()
      }
    }

    // iter(20)
  }

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
