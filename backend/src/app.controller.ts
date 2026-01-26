import { CrashReportRepository, UserRepository } from '@database'
import { CrashReportCommand } from '@magic3t/api-types'
import { CrashReportRow, WithId } from '@magic3t/database-types'
import { Body, Controller, Get, Post, Redirect } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'

@Controller()
export class AppController {
  constructor(private readonly crashReportRepository: CrashReportRepository, private usersRepository: UserRepository) {}

  @Get('/')
  @Redirect('/api')
  @ApiExcludeEndpoint()
  root() {}

  @Get('teapot')
  async teapot() {
    const users = await this.usersRepository.listAll()
    await Promise.all(users.map(async (user) => {
      await this.usersRepository.update(user.id, {
        'elo.challenger': false,
      })
    }))
    console.log(`Updated ${users.length} users to remove glicko field.`)

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

  @ApiOperation({
    summary: 'Report a crash',
    description: 'Endpoint to report crashes from the client.',
  })
  @Throttle({ short: { limit: 2, ttl: 60 * 1000 } })
  @Throttle({ medium: { limit: 5, ttl: 60 * 60 * 1000 } })
  @Post('crash-report')
  reportCrash(@Body() command: CrashReportCommand) {
    const row: Omit<CrashReportRow, keyof WithId> = {
      source: 'client',
      date: new Date(),
      error: command.error,
      metadata: command.metadata ?? null,
    }

    this.crashReportRepository.create(row)
  }
}
