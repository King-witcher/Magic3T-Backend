import { Body, Controller, Get, HttpCode, Param, Post, UsePipes, ValidationPipe, NotFoundException, ForbiddenException } from '@nestjs/common'
import { SignInDto } from './dto/signIn.dto'
import { RegistryService } from '../registry/registry.service'
import { SessionService } from './session.service'
import { ProfileService } from '../profile/profile.service'

@Controller('session')
export class SessionController {
  constructor(
    private registryService: RegistryService,
    private sessionService: SessionService,
    private profileService: ProfileService,
  ) { }

  @Post()
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  async signIn(@Body() body: SignInDto) {
    console.log(body)
    const registry = await this.registryService.findByUsername(body.username)
    if (!registry) throw new ForbiddenException()

    if (registry.checkPassword(body.password)) {
      const token = this.sessionService.createSession(registry.profile?.id || 1)
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
    const userId = this.sessionService.getUserIdFromToken(token)
    if (userId)
      return {
        authenticated: true
      }
    else
      throw new NotFoundException({
        authenticated: false
      })
  }
}
