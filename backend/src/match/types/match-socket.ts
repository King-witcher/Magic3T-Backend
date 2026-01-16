import { GameClientEventsMap, GameServerEventsMap } from '@magic3t/api-types'
import { DefaultEventsMap, Socket } from 'socket.io'
import { AuthSocketData } from '@/auth/auth-socket'
import { Perspective } from '../lib/perspective'

export type MatchSocketData = AuthSocketData & {
  perspective: Perspective
}

export type MatchSocket = Socket<
  GameClientEventsMap,
  GameServerEventsMap,
  DefaultEventsMap,
  MatchSocketData
>
