import { Controller, Get, ImATeapotException, Redirect } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger'
import { UserRepository } from './database'
import { RatingService } from './rating'

@Controller()
export class AppController {
  @Get('/')
  @Redirect('/api')
  @ApiExcludeEndpoint()
  root() {}

  constructor(
    private usersRepository: UserRepository,
    private ratingService: RatingService
  ) {}

  @Get('teapot')
  @ApiExcludeEndpoint()
  async teapot() {
    throw new ImATeapotException()
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
