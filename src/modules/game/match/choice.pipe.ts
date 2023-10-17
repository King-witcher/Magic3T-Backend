import { ArgumentMetadata, PipeTransform, ValidationPipe } from '@nestjs/common'
import { InvalidChoiceError } from './errors/InvalidChoiceError'
import { Choice } from './models/Choice'

export class ChoicePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): Choice {
    if (typeof value === 'string') value = parseInt(value)

    if (!this.isChoice(value)) throw new InvalidChoiceError()

    return value
  }

  isChoice(value: any) {
    if (typeof value === 'number' && value % 1 === 0 && 0 < value && value < 10)
      return true
    return false
  }
}
