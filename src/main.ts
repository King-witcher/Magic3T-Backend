import { NestFactory } from '@nestjs/core'

import { Logger, ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import './lib/LMM'

async function bootstrap() {
  const logger = new Logger('bootstrap function')

  const port = process.env.PORT || 4000
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()
  await app.listen(port)
  logger.log(`Server running on port ${port}`)
}

bootstrap()
