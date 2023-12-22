import { Injectable } from '@nestjs/common'
import { EmitEvents, QueueSocket } from './queue/types/QueueSocket'
import { EventNames, EventParams } from 'socket.io/dist/typed-events'

@Injectable()
export class SocketsService {
  private socketMap: Record<string, QueueSocket[]> = {}

  add(uid: string, socket: QueueSocket) {
    if (this.socketMap[uid] && this.socketMap[uid].includes(socket)) return

    if (this.socketMap[uid]) this.socketMap[uid].push(socket)
    else this.socketMap[uid] = [socket]
  }

  getUserCount() {
    return Object.keys(this.socketMap).length
  }

  remove(uid: string, socket: QueueSocket) {
    const sockets = this.socketMap[uid]
    if (!sockets) throw new Error('Uid not found')
    this.socketMap[uid].splice(sockets.indexOf(socket), 1)
    if (this.socketMap[uid].length === 0) delete this.socketMap[uid]
  }

  emit<Ev extends EventNames<EmitEvents>>(
    uid: string,
    event: Ev,
    ...data: EventParams<EmitEvents, Ev>
  ) {
    const sockets = this.socketMap[uid]
    if (!sockets) {
      console.error(`Socket uid ${uid} not found.`)
      return
    }

    for (const socket of sockets) {
      socket.emit(event, ...data)
    }
  }
}
