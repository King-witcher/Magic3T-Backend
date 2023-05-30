import { IsNotEmpty, MaxLength } from 'class-validator'

export default class SendMessageDTO {
  @IsNotEmpty()
  @MaxLength(200)
  content: string
}
