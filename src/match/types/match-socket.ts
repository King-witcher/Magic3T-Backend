import { AuthSocketData } from '@/auth/auth-socket'
import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { Perspective } from '../lib/perspective'
import { GameClientEventsMap, GameServerEventsMap } from '@magic3t/types'

export type MatchSocketData = AuthSocketData & {
  perspective: Perspective
}

export type MatchSocket = Socket<
  GameClientEventsMap,
  GameServerEventsMap,
  DefaultEventsMap,
  MatchSocketData
>
