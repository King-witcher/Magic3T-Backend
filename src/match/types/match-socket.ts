import { AuthSocketData } from '@/auth/auth-socket'
import { GameClientEventsMap, GameServerEventsMap } from '@magic3t/types'
import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
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
