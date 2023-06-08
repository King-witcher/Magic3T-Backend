import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  ForbiddenException,
  Headers,
} from '@nestjs/common'
import { SignInDto } from './dto/signIn.dto'
import { RegistryService } from '../registry/registry.service'
import { SessionService } from './session.service'
import { Profile } from 'src/entities/Profile'
import { Session } from './session.decorator'

@UsePipes(new ValidationPipe())
@Controller('session')
export class SessionController {
  constructor(
    private registryService: RegistryService,
    private sessionService: SessionService
  ) {}

  @Get('')
  async getProfile(@Session() session: Profile) {
    if (session) return session
    else throw new NotFoundException()
  }

  @Post()
  @HttpCode(200)
  async signIn(@Body() body: SignInDto, @Session() profile: Profile) {
    const registry = await this.registryService.findByUsername(body.username)
    if (!registry) throw new ForbiddenException()

    if (registry.checkPassword(body.password)) {
      const token = this.sessionService.createSession(registry.profile)
      return {
        statusCode: 200,
        token: token,
      }
    } else {
      throw new ForbiddenException()
    }
  }
  @Get(':token')
  async findSession(@Param('token') token: string) {
    const userId = this.sessionService.getProfile(token)
    if (userId)
      return {
        authenticated: true,
      }
    else
      throw new NotFoundException({
        authenticated: false,
      })
  }
}
