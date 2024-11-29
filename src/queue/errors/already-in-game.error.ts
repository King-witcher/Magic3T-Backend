import { BaseError } from '@/common/errors/base-error'
import { HttpStatus } from '@nestjs/common'

export class AlreadyInGameError extends BaseError {
  constructor() {
    super(
      'you are already in a match and cannot queue until the match ends',
      HttpStatus.CONFLICT,
    )
  }
}
