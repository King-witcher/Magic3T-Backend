import { IsNotEmpty, MaxLength, MinLength } from "class-validator"

export class SignInDto {
  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(4)
  username: string

  @IsNotEmpty()
  @MaxLength(30)
  password: string
}