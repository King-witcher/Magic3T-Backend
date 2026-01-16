import { ChangeIconCommand, ChangeNicknameCommand, RegisterUserCommand } from '@magic3t/api-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNumber, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class RegisterUserCommandClass implements RegisterUserCommand {
  @ApiProperty({
    type: 'string',
    description: 'The user nickname',
  })
  nickname: string
}

export class ChangeNickCommandClass implements ChangeNicknameCommand {
  @IsDefined()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  @Matches(/^[a-zA-Z0-9áÁâÂãÃàÀäÄéÉêÊèÈëËíÍîÎìÌïÏóÓôÔõÕòÒöÖúÚûÛùÙüÜçÇñÑ\s]*$/)
  @ApiProperty({
    minLength: 3,
    maxLength: 16,
  })
  nickname: string
}

export class ChangeIconCommandClass implements ChangeIconCommand {
  @ApiProperty()
  @IsNumber()
  @IsDefined()
  iconId: number
}
