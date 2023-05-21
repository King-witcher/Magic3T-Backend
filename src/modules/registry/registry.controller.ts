import {
  Body,
  Controller,
  HttpException,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { CreateAccountDto } from './dto/createAccountDto'
import { RegistryService } from './registry.service'

@Controller('registry')
export class RegistryController {
  constructor(private registryService: RegistryService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createAccount(@Body() { email, username, password }: CreateAccountDto) {
    try {
      await this.registryService.createRegistry(email, username, password)
    } catch (error: any) {
      throw new HttpException('Bad request', 400)
    }
  }
}
