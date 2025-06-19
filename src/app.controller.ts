import { Controller, Get, ImATeapotException, Redirect } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger'
import { UserRepository } from './database'
import { RatingService } from './rating'

const Package = require('../package.json')

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
  // @ApiExcludeEndpoint()
  async teapot() {
    const users = await this.usersRepository.getAll()
    for (const user of users) {
      const dto = await this.ratingService.getRatingDto(user)
      const countedMatches =
        user.stats.defeats + user.stats.wins + user.stats.draws
      const progressMatches = Math.floor(dto.progress / 10)
      const matches = Math.max(countedMatches, progressMatches)
      user.elo = {
        score: user.glicko.rating,
        k: Math.max(30, Math.sqrt(user.glicko.deviation / 350) * 100),
        matches: matches,
      }
      await this.usersRepository.update(user)
    }

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

  @ApiOperation({
    summary: 'Api version',
    description: 'Returns the current api version.',
  })
  @Get('version')
  getVersion() {
    return Package.version
  }
}
