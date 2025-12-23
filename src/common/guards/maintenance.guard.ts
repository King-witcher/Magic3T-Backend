import { ConfigRepository } from '@/database'
import { CanActivate, Injectable, Logger } from '@nestjs/common'

@Injectable()
export class MaintenanceGuard implements CanActivate {
  private readonly logger = new Logger(MaintenanceGuard.name, {
    timestamp: true,
  })

  constructor(private readonly configRepository: ConfigRepository) {}

  async canActivate() {
    const devopsConfig = await this.configRepository.getDevopsConfig()
    if (devopsConfig.isErr()) {
      this.logger.fatal(
        'Could not retrieve devops config to check maintenance mode'
      )
      return false
    }

    if (devopsConfig.unwrap().maintenance_mode) {
      this.logger.fatal('Request blocked by maintenance mode')
      return false
    }
    return true
  }
}
