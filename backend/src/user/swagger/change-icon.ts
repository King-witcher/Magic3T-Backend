import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNumber } from 'class-validator'

export class ChangeIconDto {
  @ApiProperty()
  @IsNumber()
  @IsDefined()
  iconId: number
}
