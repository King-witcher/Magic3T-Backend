import { UserRow } from '@magic3t/types'
import { Controller, Get, Redirect } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger'
import { UserRepository } from './database'

@Controller()
export class AppController {
  constructor(private userRepository: UserRepository) {}

  @Get('/')
  @Redirect('/api')
  @ApiExcludeEndpoint()
  root() {}

  @Get('teapot')
  async teapot() {
    this.userRepository.save({
      _id: 'teapot',
      experience: 0,
    } as UserRow)
    return Err('I am a teapot')
  }

  @ApiOperation({
    summary: 'Service status',
    description: 'Returns the service status for tracking downtimes.',
  })
  @Get('status')
  async status() {
    return {
      status: 'available',
    }
  }
}
