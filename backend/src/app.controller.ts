import { Controller, Get, Redirect } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger'

@Controller()
export class AppController {
  @Get('/')
  @Redirect('/api')
  @ApiExcludeEndpoint()
  root() {}

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
