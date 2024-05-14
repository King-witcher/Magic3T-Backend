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
import { FirebaseService } from '@modules/firebase/firebase.service'

@Controller('')
export class MatchController {
  constructor(
    private matchService: MatchService,
    private firebaseService: FirebaseService,
  ) {}

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
