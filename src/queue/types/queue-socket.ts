import { Server, Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

import { QueueServerEventsMap, QueueClientEventsMap } from '@magic3t/types/'

export type QueueSocket = Socket<
  QueueClientEventsMap,
  QueueServerEventsMap,
  DefaultEventsMap
>

export type QueueServer = Server<
  QueueClientEventsMap,
  QueueServerEventsMap,
  DefaultEventsMap
>
