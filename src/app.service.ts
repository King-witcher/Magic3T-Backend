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

    const reup_rate = Number.parseInt(process.env.HEARTBEAT_RATE)

    // Define the function that will circularly call the server.
    async function heartbeat() {
      const response = await fetch(`${backend_url}/status`)
      const body = await response.json()
      return <string>body.status
    }

    // Define the recursive function that calls itself in a loop.
    async function recursion() {
      const initialTime = Date.now()

      // Define a function to handle the scenario where a heartbeat call resolved without throwing errors.
      function handleHeartbeat(status: string) {
        logger.verbose(`Received "${status}" from heartbeat.`)
        const delta = Date.now() - initialTime
        // Recursively calls the recursive function again.
        setTimeout(recursion, Math.max(reup_rate - delta, 0))
      }

      heartbeat()
        .then(handleHeartbeat)
        .catch((error: Error) => {
          // If the heartbeat failed once, wait for 1 second and then retry.
          logger.warn(`Heartbeat failed due to ${error.cause}. Retrying.`)
          setTimeout(() => {
            heartbeat()
              .then(handleHeartbeat)
              .catch((error: Error) => {
                // If it fails again, stops heartbeating and do not call the recursive function anymore.
                // This behavior can be changed.
                logger.error(`Heartbeat retry failed due to ${error.cause}.`)
              })
          }, 1000)
        })
    }

    recursion()
  }
}
