import { HttpStatus, PipeTransform } from '@nestjs/common'
import { OldBaseError } from '@/common'

class InvalidGameModeError extends OldBaseError {
  constructor(value: unknown) {
    super(
      `invalid game mode "${value}". game mode must be "casual" or "ranked"`,
      HttpStatus.BAD_REQUEST
    )
  }
}

export class GameModePipe implements PipeTransform {
  transform(value: unknown): 'casual' | 'ranked' {
    if (typeof value !== 'string') {
      throw new InvalidGameModeError(value)
    }

    if (value !== 'casual' && value !== 'ranked') {
      throw new InvalidGameModeError(value)
    }

    return value
  }
}
