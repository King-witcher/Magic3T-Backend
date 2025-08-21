import { DefaultEventsMap, Server, Socket } from 'socket.io'

import { QueueClientEventsMap, QueueServerEventsMap } from '@magic3t/types'

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
