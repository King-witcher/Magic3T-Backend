import { Choice } from './Choice'

export interface PlayerMove {
  player: 'white' | 'black'
  move: Choice | 'forfeit' | 'timeout'
  time: number
}
