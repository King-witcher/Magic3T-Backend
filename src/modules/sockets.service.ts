import { Injectable } from '@nestjs/common'
import {
  DefaultEventsMap,
  EventNames,
  EventParams,
  EventsMap,
} from 'socket.io/dist/typed-events'
import { Socket } from 'socket.io'

@Injectable()
export class SocketsService<EmitType extends EventsMap> {
  private socketMap: Record<string, Socket<DefaultEventsMap, EmitType>[]> = {}

  /**
   * Binds a socket to a specific uid. More than one socket can be bound to the same uid.
   * @param uid
   * @param socket
   */
  add(uid: string, socket: Socket<DefaultEventsMap, EmitType>) {
    if (this.socketMap[uid]?.includes(socket)) return

    console.log(`[SocketsService] Push ${uid}`)

    if (this.socketMap[uid]) this.socketMap[uid].push(socket)
    else this.socketMap[uid] = [socket]
  }

  getUserCount() {
    return Object.keys(this.socketMap).length
  }

  /**
   * Unbinds a socket from a uid.
   * @param uid
   * @param socket
   */
  remove(uid: string, socket: Socket<DefaultEventsMap, EmitType>) {
    const sockets = this.socketMap[uid]
    if (!sockets) throw new Error('Uid not found')
    this.socketMap[uid].splice(sockets.indexOf(socket), 1)
    if (this.socketMap[uid].length === 0) delete this.socketMap[uid]
  }

  /**
   * Emits an event to each socket bound to an uid.
   * @param uid
   * @param event
   * @param data
   */
  emit<Ev extends EventNames<EmitType>>(
    uid: string,
    event: Ev,
    ...data: EventParams<EmitType, Ev>
  ) {
    const sockets = this.socketMap[uid]
    if (!sockets) {
      console.log(event)
      console.error(`Socket uid ${uid} not found.`)
      return
    }

    for (const socket of sockets) {
      socket.emit(event, ...data)
    }
  }
}
