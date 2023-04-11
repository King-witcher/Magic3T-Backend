import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { CreateAccountDto } from './dto/createAccountDto'
import { RegistryService } from './registry.service'

@Controller('registry')
export class RegistryController {
  constructor (
    private registryService: RegistryService
  ) { }

  @Post()
  @UsePipes(new ValidationPipe())
  async createAccount(@Body() { email, username, password }: CreateAccountDto) {
    await this.registryService.createRegistry(email, username, password)
  }
}
