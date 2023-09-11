import { WsException } from '@nestjs/websockets'

export class WrongTurnException extends WsException {
  constructor() {
    super('Wrong turn.')
  }
}

export class GameFinishedException extends WsException {
  constructor() {
    super('Game already finished')
  }
}

export class ChoiceUnavailableException extends WsException {
  constructor() {
    super('Choice unavailable.')
  }
}
