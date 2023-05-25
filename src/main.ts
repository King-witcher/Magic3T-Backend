import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { config } from 'dotenv'
config()
import { AppModule } from './app.module'
import { Player } from './lib/Player'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const port = process.env.PORT || 4000
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()
  app.use(cookieParser())
  await app.listen(port)
  console.log(`Listening on port ${port}`)
}

bootstrap()
