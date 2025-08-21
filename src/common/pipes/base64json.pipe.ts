import { HttpStatus, PipeTransform } from '@nestjs/common'
import { BaseError } from '../errors'

export class Base64JsonPipe implements PipeTransform {
  transform(value: unknown): object {
    if (typeof value === 'string') {
      try {
        const string = Buffer.from(value, 'base64url').toString('utf-8')
        return JSON.parse(string)
      } catch {
        throw new BaseError('Bad request', HttpStatus.BAD_REQUEST)
      }
    }
    throw new BaseError('Bad request', HttpStatus.BAD_REQUEST)
  }
}
