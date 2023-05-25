import { Controller, Get, NotImplementedException } from '@nestjs/common'

@Controller('profiles')
export class ProfileController {
  constructor() {}

  @Get('nicknames/:nickname')
  getProfile() {}
}
