import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'

import { MatchService } from './services'
import { CurrentMatchAdapter } from './decorators'
import { MatchSideAdapter } from './types'
import { ApiOperation } from '@nestjs/swagger'
import { MatchGuard } from './match.guard'
import { AuthGuard } from '@/auth/auth.guard'

@UseGuards(AuthGuard)
@Controller('match')
export class MatchController {
  constructor(private matchService: MatchService) {}

  @ApiOperation({
    summary: 'Forfeit',
    description: 'Forfeit the current match',
  })
  @Post(':matchId/forfeit')
  @HttpCode(200)
  @UseGuards(MatchGuard)
  handleForfeit(@CurrentMatchAdapter() matchAdapter: MatchSideAdapter) {
    matchAdapter.forfeit()
  }

  @ApiOperation({
    summary: 'Get state',
    description: 'Get the state of the current match',
  })
  @Get('state')
  getState() {
    return 1
  }

  // @Get('matchId')
  // async handleGetMatch(@Headers('Authorization') authorization: string) {
  //   let authData: DecodedIdToken
  //   if (!authorization) {
  //     throw new UnauthorizedException('No Authorization header')
  //   }
  //
  //   try {
  //     authData = await this.firebaseService.firebaseAuth.verifyIdToken(
  //       authorization.replace('Bearer ', ''),
  //     )
  //   } catch (e) {
  //     console.error(e)
  //     throw new BadRequestException()
  //   }
  //
  //   const match = this.matchService.playerMatches[authData.uid]
  //   if (match)
  //     return {
  //       id: match.id,
  //     }
  //   else throw new NotFoundException('Match not found')
  // }
}
