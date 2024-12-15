import {
  IsDefined,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

export class ChangeNickDto {
  @IsDefined()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  @Matches(/[a-zA-Z0-9áÁâÂãÃàÀäÄéÉêÊèÈëËíÍîÎìÌïÏóÓôÔõÕòÒöÖúÚûÛùÙüÜçÇñÑ\s]/)
  nickname: string
}
