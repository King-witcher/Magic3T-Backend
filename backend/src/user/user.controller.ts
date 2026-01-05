import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'
import { HttpFilter } from '@/common/filters/http.filter'
import { UserPayload } from '@/database'
import { ChangeIconDto } from './swagger/change-icon'
import { ChangeNickDto } from './swagger/change-nick'
import { RegisterUserCommand } from './swagger/register-user'
import { UserService } from './user.service'

@Controller('users')
@UseFilters(HttpFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('id/:id')
  @ApiOperation({
    summary: 'Get a user by id',
  })
  @ApiResponse({
    type: UserPayload,
  })
  async getById(@Param('id') id: string): Promise<UserPayload> {
    const user = await this.userService.getById(id)
    if (!user) throw new NotFoundException()
    return user
  }

  @Get('nickname/:nickname')
  @ApiOperation({
    summary: 'Get a user by nickname',
    description: 'Casing and spaces are ignored.',
  })
  @ApiResponse({
    type: UserPayload,
  })
  async getByNickname(@Param('nickname') nickname: string): Promise<UserPayload> {
    const user = await this.userService.getByNickname(nickname)
    if (!user) throw new NotFoundException()
    return user
  }

  @Get('ranking')
  @ApiOperation({
    summary: 'Gets the top 30 ranked players',
  })
  @ApiResponse({
    isArray: true,
    type: UserPayload,
  })
  async getRanking(): Promise<UserPayload[]> {
    return await this.userService.getRanking()
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get the currently connected user',
  })
  @ApiResponse({
    type: UserPayload,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getMe(@UserId() userId: string) {
    const user = await this.userService.getById(userId)
    if (!user) throw new NotFoundException()
    return user
  }

  @Patch('me/nickname')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update nickname',
  })
  async changeNickName(@UserId() userId: string, @Body() changeNickDto: ChangeNickDto) {
    await this.userService.changeNickName(userId, changeNickDto.nickname)
  }

  @Post('register')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Register an authenticated user in the database information',
  })
  async register(@UserId() userId: string, @Body() body: RegisterUserCommand) {
    console.log('aa')
    await this.userService.register(userId, body)
  }

  @Get('me/icons')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all available icons for a user',
  })
  @ApiResponse({
    type: Number,
    isArray: true,
    description: 'A list with all icon ids available',
  })
  @ApiBearerAuth()
  async getIcons(@UserId() userId: string) {
    return await this.userService.getIcons(userId)
  }

  @Patch('me/icon')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update summoner icon',
  })
  @ApiBearerAuth()
  async changeSummonerIcon(@UserId() userId: string, @Body() changeIconDto: ChangeIconDto) {
    await this.userService.changeIcon(userId, changeIconDto.iconId)
  }
}
