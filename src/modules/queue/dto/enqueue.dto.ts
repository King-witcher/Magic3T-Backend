import { IsNotEmpty, ValidateIf, isNotEmpty } from "class-validator"

export class EnqueueDto {
  @IsNotEmpty()
  matchType: 'casual' | 'ranked'
  
  sessionId: string | null
}