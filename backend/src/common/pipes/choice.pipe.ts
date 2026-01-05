import { Choice } from '@magic3t/types'
import { HttpStatus, PipeTransform } from '@nestjs/common'
import { BaseError } from '../errors'

export class ChoicePipe implements PipeTransform {
  transform(value: unknown): Choice {
    if (typeof value === 'string') {
      const value_ = Number.parseInt(value, 10)
      if (!this.isChoice(value_)) throw new BaseError('Invalid choice', HttpStatus.BAD_REQUEST)
      return value_
    }

    if (!this.isChoice(value)) throw new BaseError('Invalid choice', HttpStatus.BAD_REQUEST)
    return value
  }

  isChoice(value: unknown): value is Choice {
    if (typeof value === 'number' && value % 1 === 0 && 0 < value && value < 10) return true
    return false
  }
}
