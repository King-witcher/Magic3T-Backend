import { Injectable } from '@nestjs/common'
import { EmitEvents, QueueSocket } from './types/QueueSocket'
import { EventNames, EventParams } from 'socket.io/dist/typed-events'

@Injectable()
export class SocketsService {
  private socketMap: Record<string, QueueSocket[]> = {}

  add(uid: string, socket: QueueSocket) {
    if (this.socketMap[uid] && this.socketMap[uid].includes(socket)) return

    if (this.socketMap[uid]) this.socketMap[uid].push(socket)
    else this.socketMap[uid] = [socket]
  }

  remove(uid: string, socket: QueueSocket) {
    const sockets = this.socketMap[uid]
    if (!sockets) throw new Error('Uid not found')
    this.socketMap[uid].splice(sockets.indexOf(socket), 1)
  }

  emit<Ev extends EventNames<EmitEvents>>(uid: string, event: Ev, ...data: EventParams<EmitEvents, Ev>) {
    const sockets = this.socketMap[uid]
    if (!sockets) return

    for (const socket of sockets) {
      socket.emit(event, ...data)
    }
  }
}
