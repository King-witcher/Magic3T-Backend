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

  @ApiOperation({
    summary: 'Update nickname',
  })
  @Patch('me/nickname')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
  })
  async changeNickName(
    @UserId() userId: string,
    @Body() changeNickDto: ChangeNickDto,
  ) {
    await this.userService.changeNickName(userId, changeNickDto.nickname)
  }
}
