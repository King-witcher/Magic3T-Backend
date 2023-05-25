import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpException,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { CreateAccountDto } from './dto/createAccountDto'
import { RegistryService } from './registry.service'
import { ProfileService } from '../profile/profile.service'

@Controller('registries')
export class RegistryController {
  constructor(
    private registryService: RegistryService,
    private profileService: ProfileService
  ) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createAccount(
    @Body() { email, username, password, nickname }: CreateAccountDto
  ) {
    if (await this.profileService.existsNickname(nickname))
      throw new ConflictException('nickname taken')
    if (await this.registryService.existsUsername(username))
      throw new ConflictException('username taken')
    await this.registryService.createRegistryAndProfile(
      email,
      username,
      password,
      nickname
    )
  }
}
