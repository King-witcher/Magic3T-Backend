import { NestFactory } from '@nestjs/core'

import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import './lib/LMM'

async function bootstrap() {
  const port = process.env.PORT || 4000
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()
  await app.listen(port)
  console.log(`Server running on port ${port}.`)
}

bootstrap()
