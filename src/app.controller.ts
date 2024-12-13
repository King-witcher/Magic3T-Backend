import { Controller, Get, ImATeapotException, Logger } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

const Package = require('../package.json')

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor() {
    const logger = this.logger
    const backend_url = process.env.MAGIC3T_BACKEND_URL
    const reup_rate = Number.parseInt(process.env.REUP_RATE)

    async function tick() {
      const initialTime = Date.now()

      if (!backend_url) return
      const response = await fetch(`${backend_url}/status`)
      const body = await response.json()

      logger.debug(`Received status ${body.status} from tick.`)

      const delta = Date.now() - initialTime
      setTimeout(tick, Math.max(reup_rate - delta, 0))
    }

    tick()
  }

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
