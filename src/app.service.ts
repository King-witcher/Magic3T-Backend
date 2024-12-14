import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name)

  keepServerAlive() {
    const logger = this.logger
    const backend_url = process.env.MAGIC3T_BACKEND_URL
    if (!backend_url) {
      // eslint-disable-next-line quotes
      Logger.error("Backend url env var not found. Couldn't setup reup ticks.")
      return
    }

    const reup_rate = Number.parseInt(process.env.REUP_RATE)

    async function tick() {
      const initialTime = Date.now()
      try {
        const response = await fetch(`${backend_url}/status`)
        const body = await response.json()

        logger.debug(`Received status ${body.status} from re-up tick.`)

        const delta = Date.now() - initialTime
        setTimeout(tick, Math.max(reup_rate - delta, 0))
      } catch (e) {
        logger.error(`Failed to send reup tick: ${e.code}`)
        if (e.code === 'ECONNRESET') {
          setTimeout(tick, 1000)
        }
      }
    }

    tick()
  }
}
