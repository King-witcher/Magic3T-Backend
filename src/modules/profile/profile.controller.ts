import { Controller, Get, NotImplementedException } from '@nestjs/common';

@Controller('profile')
export class ProfileController {
  @Get()
  getProfile() {
    throw new NotImplementedException()
  }
}
