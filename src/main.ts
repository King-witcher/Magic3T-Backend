import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { config } from 'dotenv'
config()
import { AppModule } from './modules/app.module'
import { getApps } from 'firebase-admin/app'

async function bootstrap() {
  const port = process.env.PORT || 4000
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()
  await app.listen(port)
  console.log(`Server running on port ${port}.`)
}

const app = getApps()

bootstrap()
