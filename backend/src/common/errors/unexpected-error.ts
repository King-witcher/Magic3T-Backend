import { InternalServerErrorException } from '@nestjs/common'

/**
 * Represents an unexpected error that occurred in the application.
 */
export class UnexpectedError extends InternalServerErrorException {
  constructor(
    public readonly code: string,
    message?: string
  ) {
    super(code, message)
  }
}

export function unexpected(
  code = 'unexpected_error',
  message = 'An unexpected error occurred'
): never {
  throw new UnexpectedError(code, message)
}
