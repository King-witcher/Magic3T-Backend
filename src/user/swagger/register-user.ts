import { RegisterUserCommand as RegisterUserCommandType } from '@magic3t/types'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterUserCommand implements RegisterUserCommandType {
  @ApiProperty({
    type: 'string',
    description: 'The user nickname',
  })
  nickname: string
}
