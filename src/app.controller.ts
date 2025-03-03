import { Controller, Get, ImATeapotException, Redirect } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger'

const Package = require('../package.json')

@Controller()
export class AppController {
  @Get('/')
  @Redirect('/api')
  @ApiExcludeEndpoint()
  root() {}

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

  @ApiOperation({
    summary: 'Api version',
    description: 'Returns the current api version.',
  })
  @Get('version')
  getVersion() {
    return Package.version
  }
}
