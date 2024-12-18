import { AuthGuard } from '@/auth/auth.guard'
import { UserId } from '@/auth/user-id.decorator'
import {
  Body,
  Controller,
  Get,
  NotImplementedException,
  Patch,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import { ChangeNickDto } from './dtos/change-nick'
import { HttpFilter } from '@/common/filters/http.filter'
import { UserService } from './user.service'
import { ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger'
import { ChangeIconDto } from './dtos/change-icon'

@Controller('user')
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
    @Body() changeNickDto: ChangeNickDto,
  ) {
    await this.userService.changeNickName(userId, changeNickDto.nickname)
  }

  @Patch('me/icon')
  @ApiOperation({
    summary: 'Update summoner icon'
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
