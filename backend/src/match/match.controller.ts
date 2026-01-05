import { GetMatchesResult } from '@magic3t/types'
import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'
import { CurrentPerspective } from './decorators'
import { MatchBank, Perspective } from './lib'
import { MatchGuard } from './match.guard'
import { MatchService } from './match.service'
import { GetMatchesResult as GetMatchesPayloadClass } from './swagger/get-matches'

@Controller('matches')
export class MatchController {
  constructor(
    private matchBank: MatchBank,
    private matchService: MatchService
  ) {
    // const names = [BotName.Bot0, BotName.Bot1, BotName.Bot2, BotName.Bot3]
    // function shuffle() {
    //   let currentIndex = names.length
    //   while (currentIndex) {
    //     const randomIndex = Math.floor(Math.random() * currentIndex--)
    //     const temp = names[randomIndex]
    //     names[randomIndex] = names[currentIndex]
    //     names[currentIndex] = temp
    //   }
    // }
    // async function createRandomCvC() {
    //   shuffle()
    //   const [match1, match2] = await Promise.all([
    //     matchService.createCvCMatch(names[0], names[1]),
    //     matchService.createCvCMatch(names[2], names[3]),
    //   ])
    //   let terminated = 0
    //   return new Promise<void>((res) => {
    //     match1.on(MatchEventType.Finish, () => {
    //       if (++terminated === 2) res()
    //     })
    //     match2.on(MatchEventType.Finish, () => {
    //       if (++terminated === 2) res()
    //     })
    //   })
    // }
    // async function iter(count: number) {
    //   for (let i = 0; i < count; i++) {
    //     console.log(`iteration ${i + 1}`)
    //     await createRandomCvC()
    //   }
    // }
    // iter(20)
  }

  @Post(':matchId/forfeit')
  @ApiOperation({
    summary: 'Forfeit',
    description: 'Forfeit the current match',
  })
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
  @UseGuards(AuthGuard)
  handleCurrentMatch(@UserId() userId: string) {
    const perspective = this.matchBank.getPerspective(userId)
    if (!perspective) throw new NotFoundException()
    return {
      id: perspective.match.id,
    }
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get recent matches',
    description: 'Get the most recent matches played by a user, sorted by date',
  })
  @ApiResponse({
    type: [GetMatchesPayloadClass],
  })
  async getMatchesByUser(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('cursor') cursor: string,
    @Param('userId') userId: string
  ): Promise<GetMatchesResult> {
    return this.matchService.getMatchesByUser(userId, limit, cursor)
  }
}
