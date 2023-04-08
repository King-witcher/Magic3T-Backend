import { Body, Controller, Post, Get, UsePipes, ValidationPipe, ForbiddenException, Param, NotFoundException } from '@nestjs/common'
import { SignInDto } from 'src/controllers/session/signIn.dto'
import { RegistersService } from 'src/services/registers/registers.service'
import { SessionService } from 'src/services/session/session.service'
import { UsersService } from 'src/services/users/users.service'

@Controller('session')
export class SessionController {
  constructor (
    private registersService: RegistersService,
    private userService: UsersService,
    private sessionService: SessionService,
  ) { }

  @Post()
  @UsePipes(new ValidationPipe())
  async login(@Body() body: SignInDto) {
    const register = await this.registersService.getRegister(body.username)

    if (!register) {
      this.registersService.fakeValidatePassword()
      throw new ForbiddenException()
    }

    if (!this.registersService.validatePassword(register, body.password))
      throw new ForbiddenException()

    const user = await this.userService.findByRegister(register)
    const token = this.sessionService.createSession(register.userData.id)

    return {
      token,
      user,
    }
  }
  
  @Get(':token')
  async getSession(@Param('token') token: string) {
    const session = this.sessionService.getSessionByToken(token)
    if (session) {
      const user = this.userService.findById(session.userId)
      return user
    } else {
      throw new NotFoundException()
    }
  }
}
 