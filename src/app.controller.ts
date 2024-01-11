import { Controller, Get, ImATeapotException, Req } from '@nestjs/common'
import { Request } from 'express'
const Package = require('../package.json')

@Controller()
export class AppController {
  @Get('teapot')
  teapot() {
    throw new ImATeapotException()
  }

  @Get('status')
  status() {
    const rand = Math.random()
    if (rand < 0.0001) throw new ImATeapotException()
    return {
      status: 'available',
    }
  }

  @Get('version')
  getVersion() {
    return Package.version
  }
}
