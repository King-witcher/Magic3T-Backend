import { Injectable, Logger } from '@nestjs/common'
import { DefaultEventsMap, Socket } from 'socket.io'
import {
  EventNames,
  EventParams,
  EventsMap,
} from '@socket.io/component-emitter'

@Injectable()
export class SocketsService<EmitType extends EventsMap> {
  private readonly logger = new Logger(SocketsService.name, { timestamp: true })
  private socketMap: Record<string, Socket<DefaultEventsMap, EmitType>[]> = {}

  /**
   * Binds a socket to a specific uid. More than one socket can be bound to the same uid.
   * @param userId
   * @param socket
   */
  add(userId: string, socket: Socket<DefaultEventsMap, EmitType>) {
    if (this.socketMap[userId]?.includes(socket)) return

    if (this.socketMap[userId]) this.socketMap[userId].push(socket)
    else this.socketMap[userId] = [socket]
    this.logger.log(`bound socket ${socket.id} to user id ${userId}`)
  }

  getUserCount() {
    return Object.keys(this.socketMap).length
  }

  /**
   * Unbinds a socket from a uid.
   * @param userId
   * @param socket
   */
  remove(userId: string, socket: Socket<DefaultEventsMap, EmitType>) {
    const sockets = this.socketMap[userId]
    if (!sockets) return

    sockets.splice(sockets.indexOf(socket), 1)
    if (sockets.length === 0) delete this.socketMap[userId]
    this.logger.log(`unbound socket ${socket.id} from user id ${userId}`)
  }

  /**
   * Emits an event to each socket bound to an uid.
   * @param userId
   * @param event
   * @param data
   */
  emit<Ev extends EventNames<EmitType>>(
    userId: string,
    event: Ev,
    ...data: EventParams<EmitType, Ev>
  ) {
    const sockets = this.socketMap[userId]
    if (!sockets) {
      this.logger.warn(
        `socket not found for ${userId}. message ${String(event)} was not sent`
      )
      return
    }

    for (const socket of sockets) {
      socket.emit(event, ...data)
    }
  }
}
