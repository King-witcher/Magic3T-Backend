import { IsInt, IsNotEmpty, Max, Min } from 'class-validator'
import { Choice } from 'src/lib/Player'

export default class ChoiceDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(9)
  value: Choice
}
