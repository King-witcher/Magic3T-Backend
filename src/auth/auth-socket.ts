import { DefaultEventsMap, Socket } from 'socket.io'

export type AuthSocketData = {
  userId: string
}

export type AuthSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  AuthSocketData
>
