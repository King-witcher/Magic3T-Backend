import { Controller, Get, ImATeapotException } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

const Package = require('../package.json')

@Controller()
export class AppController {
  @Get('teapot')
  teapot(): never {
    throw new ImATeapotException()
  }

  @ApiOperation({
    summary: 'Service status',
    description: 'Returns the service status for tracking downtimes.',
  })
  @Get('status')
  status() {
    const rand = Math.random()
    if (rand < 0.0001) throw new ImATeapotException()
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
