import { Controller, Get, ImATeapotException } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { UserRepository } from './database'

const Package = require('../package.json')

@Controller()
export class AppController {
  constructor(private userRepository: UserRepository) {}

  @Get('teapot')
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

  @ApiOperation({
    summary: 'Api version',
    description: 'Returns the current api version.',
  })
  @Get('version')
  getVersion() {
    return Package.version
  }
}
