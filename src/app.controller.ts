import { Controller, Get, ImATeapotException } from '@nestjs/common'

@Controller()
export class AppController {
  @Get('teapot')
  teapot() {
    throw new ImATeapotException()
  }

  @Get('status')
  status() {
    console.log(`Server status check at ${new Date()}.`)
    return {
      status: 'available'
    }
  }
}
