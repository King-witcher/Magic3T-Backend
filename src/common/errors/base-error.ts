import { HttpStatus } from '@nestjs/common'

export class BaseError {
  constructor(
    public readonly message: string,
    public readonly httpStatus: HttpStatus,
  ) {}
}
