import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'
import { HttpFilter } from '@/common/filters/http.filter'
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  NotImplementedException,
  Param,
  Patch,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger'
import { ChangeIconDto } from './dtos/change-icon'
import { ChangeNickDto } from './dtos/change-nick'
import { UserService } from './user.service'
import { UserDto } from '@/database'

@Controller('users')
@UseFilters(HttpFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Not implemented',
  })
  @UseGuards(AuthGuard)
  getMe() {
    throw new NotImplementedException()
  }

  @Get('id/:id')
  @ApiOperation({
    summary: 'Get a user by id',
  })
  @ApiResponse({
    type: UserDto,
  })
  async getById(@Param('id') id: string): Promise<UserDto> {
    const user = await this.userService.getById(id)
    if (!user) throw new NotFoundException()
    return user
  }

  @Get('ranking')
  @ApiOperation({
    summary: 'Gets the top 30 ranked players',
  })
  @ApiResponse({
    isArray: true,
    type: UserDto,
  })
  async getRanking(): Promise<UserDto[]> {
    return await this.userService.getRanking()
  }

  @Patch('me/nickname')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
  })
  @ApiOperation({
    summary: 'Update nickname',
  })
  async changeNickName(
    @UserId() userId: string,
    @Body() changeNickDto: ChangeNickDto
  ) {
    await this.userService.changeNickName(userId, changeNickDto.nickname)
  }

  @Patch('me/icon')
  @ApiOperation({
    summary: 'Update summoner icon',
  })
  @ApiHeader({
    name: 'Authorization',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async changeSummonerIcon(
    @UserId() userId: string,
    @Body() changeIconDto: ChangeIconDto
  ) {
    await this.userService.changeIcon(userId, changeIconDto.iconId)
  }
}
