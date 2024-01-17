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

  constructor() {
    setInterval(() => {
      console.log(this.socketMap)
    }, 1000 * 10)
  }

  add(uid: string, socket: Socket<DefaultEventsMap, EmitType>) {
    if (this.socketMap[uid] && this.socketMap[uid].includes(socket)) return

    if (this.socketMap[uid]) this.socketMap[uid].push(socket)
    else this.socketMap[uid] = [socket]
  }

  getUserCount() {
    return Object.keys(this.socketMap).length
  }

  remove(uid: string, socket: Socket<DefaultEventsMap, EmitType>) {
    const sockets = this.socketMap[uid]
    if (!sockets) throw new Error('Uid not found')
    this.socketMap[uid].splice(sockets.indexOf(socket), 1)
    if (this.socketMap[uid].length === 0) delete this.socketMap[uid]
  }

  emit<Ev extends EventNames<EmitType>>(
    uid: string,
    event: Ev,
    ...data: EventParams<EmitType, Ev>
  ) {
    const sockets = this.socketMap[uid]
    if (!sockets) {
      console.log(this.socketMap)
      console.error(`Socket uid ${uid} not found.`)
      return
    }

    for (const socket of sockets) {
      socket.emit(event, ...data)
    }
  }
}
