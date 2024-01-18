import { firebaseAuth } from '@/firebase/services'
import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { MatchService } from './match.service'
import { DecodedIdToken } from 'firebase-admin/auth'

@Controller('')
export class MatchController {
  constructor(private matchService: MatchService) {}

  @Get('matchId')
  async handleGetMatch(@Headers('Authorization') authorization: string) {
    let authData: DecodedIdToken
    if (!authorization) {
      throw new UnauthorizedException('No Authorization header')
    }

    try {
      authData = await firebaseAuth.verifyIdToken(
        authorization.replace('Bearer ', ''),
      )
    } catch (e) {
      console.error(e)
      throw new BadRequestException()
    }

    const match = this.matchService.playerMatchMap[authData.uid]
    if (match)
      return {
        id: match.id,
      }
    else throw new NotFoundException('Match not found')
  }
}
