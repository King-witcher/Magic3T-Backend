import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator"

export class CreateAccountDto {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @MaxLength(16)
  @MinLength(4)
  username: string

  @IsNotEmpty()
  @MaxLength(30)
  @MinLength(6)
  password: string
}