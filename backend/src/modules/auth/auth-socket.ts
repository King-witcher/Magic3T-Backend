import { DefaultEventsMap, Socket } from 'socket.io'

export type AuthenticSocketData = {
  userId: string
}

export type AuthenticSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  AuthenticSocketData
>
