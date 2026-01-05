import { HttpStatus } from '@nestjs/common'
import { BaseError } from '@/common/errors/base-error'

export class AlreadyInGameError extends BaseError {
  constructor() {
    super('you are already in a match and cannot queue until the match ends', HttpStatus.CONFLICT)
  }
}
