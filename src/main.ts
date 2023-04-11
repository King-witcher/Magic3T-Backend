import { config } from 'dotenv'
config()

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const port = process.env.PORT || 4000
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  await app.listen(port)
  console.log(`Listening on port ${port}`)
}

bootstrap()
