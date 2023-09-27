import { Socket } from 'socket.io'

export abstract class AuthStrategy {
  abstract validate(socket: Socket): boolean
}
