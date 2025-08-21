import { AuthSocketData } from '@/auth/auth-socket'
import { GameClientEventsMap, GameServerEventsMap } from '@magic3t/types'
import { DefaultEventsMap, Socket } from 'socket.io'
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
