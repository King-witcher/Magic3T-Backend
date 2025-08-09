import { NestFactory } from '@nestjs/core'
import './prelude'
import { Logger, ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { apiReference } from '@scalar/nestjs-api-reference'

async function bootstrap() {
  const logger = new Logger('bootstrap function')

  const port = process.env.PORT || 4000
  const backend_url = process.env.MAGIC3T_BACKEND_URL
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()

  const config = new DocumentBuilder()
    .setTitle('Magic3T API')
    .addBearerAuth()
    .setDescription(
      'Api used by the Magic3T frontend to interact with the game server'
    )
    .setVersion('2.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  app.use(
    '/api',
    apiReference({
      content: document,
    })
  )

  await app.listen(port)
  keepServerAlive()
  logger.log(`Max concurrency: ${navigator.hardwareConcurrency}`)
  logger.log(`Swagger available on ${backend_url}/api`)
}

function keepServerAlive() {
  const backend_url = process.env.MAGIC3T_BACKEND_URL
  if (!backend_url) {
    // eslint-disable-next-line quotes
    Logger.error("Backend url env var not found. Couldn't setup reup ticks.")
    return
  }

  const reup_rate = Number.parseInt(process.env.HEARTBEAT_RATE || '0')
  if (!reup_rate) return

  setInterval(() => {
    fetch(`${backend_url}/status`)
    Logger.verbose('Heartbeat request sent.')
  }, reup_rate)
}

bootstrap()
