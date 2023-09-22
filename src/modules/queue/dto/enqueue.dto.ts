import { IsNotEmpty, ValidateIf, isNotEmpty } from "class-validator"

export class EnqueueDto {
  @IsNotEmpty()
  gameMode: 'casual' | 'ranked'
  
  sessionId: string | null
}