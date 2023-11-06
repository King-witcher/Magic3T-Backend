import { PipeTransform } from '@nestjs/common'
import { InvalidChoiceError } from './errors/InvalidChoiceError'
import { Choice } from '../../types/Choice'

export class ChoicePipe implements PipeTransform {
  transform(value: unknown): Choice {
    if (typeof value === 'string') value = parseInt(value)
    if (!this.isChoice(value)) throw new InvalidChoiceError()
    return value
  }

  isChoice(value: unknown): value is Choice {
    if (typeof value === 'number' && value % 1 === 0 && 0 < value && value < 10) return true
    return false
  }
}
