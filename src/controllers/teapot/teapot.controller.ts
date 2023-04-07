import { Controller, Get, ImATeapotException } from '@nestjs/common'

@Controller('teapot')
export class TeapotController {
  @Get()
  teapot() {
    throw new ImATeapotException()
  }
}
