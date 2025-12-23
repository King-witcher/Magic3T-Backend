import {
  Controller,
  Get,
  ImATeapotException,
  Redirect,
  UseInterceptors,
} from '@nestjs/common'
import { ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger'
import { UserRepository } from './database'
import { RatingService } from './rating'
import { FirebaseService } from './firebase'
import { ResultInterceptor } from './common/interceptors/result.interceptor'
import { panic } from './common/utils/rust/panic'

@Controller()
export class AppController {
  @Get('/')
  @Redirect('/api')
  @ApiExcludeEndpoint()
  root() {}

  constructor(
    private usersRepository: UserRepository,
    private ratingService: RatingService,
    private firebaseService: FirebaseService
  ) {}

  @Get('teapot')
  async teapot() {
    return Err('I am a teapot')
  }

  @ApiOperation({
    summary: 'Service status',
    description: 'Returns the service status for tracking downtimes.',
  })
  @Get('status')
  status() {
    return {
      status: 'available',
    }
  }
}
