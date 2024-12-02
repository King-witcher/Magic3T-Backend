import { Controller, HttpCode, Post } from '@nestjs/common'

import { MatchService } from './services'
import { CurrentMatchAdapter } from './decorators'
import { MatchSideAdapter } from './types'
import { ApiOperation } from '@nestjs/swagger'

@Controller('match')
export class MatchController {
  constructor(private matchService: MatchService) {}

  @ApiOperation({
    summary: 'Forfeit',
    description: 'Forfeits the current match',
  })
  @Post('forfeit')
  @HttpCode(200)
  handleForfeit(@CurrentMatchAdapter() matchAdapter: MatchSideAdapter) {
    matchAdapter.forfeit()
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
