import { WsException } from '@nestjs/websockets'

export class InvalidChoiceError extends WsException {
  constructor() {
    super('Invalid choice')
  }
}
