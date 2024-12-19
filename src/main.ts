import { NestFactory } from '@nestjs/core'

import { Logger, ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import './lib/LMM'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const logger = new Logger('bootstrap function')

  const port = process.env.PORT || 4000
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()

  const config = new DocumentBuilder()
    .setTitle('Magic3T Api')
    .setDescription(
      'Api used by the Magic3T frontend to interact with the game server'
    )
    .setVersion('1.0')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)
  await app.listen(port)
  keepServerAlive()
  logger.log(`Server running on http://localhost:${port}`)
}

function keepServerAlive() {
  const backend_url = process.env.MAGIC3T_BACKEND_URL
  if (!backend_url) {
    // eslint-disable-next-line quotes
    Logger.error("Backend url env var not found. Couldn't setup reup ticks.")
    return
  }

  const reup_rate = Number.parseInt(process.env.HEARTBEAT_RATE)

  setInterval(() => {
    fetch(`${backend_url}/status`)
    Logger.verbose('Heartbeat request sent.')
  }, reup_rate)
}

bootstrap()
