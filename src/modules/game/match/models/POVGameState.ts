import { Choice } from './Choice'
import { PlayerStatus } from './PlayerStatus'

export type GameState = {
  playerChoices: Choice[]
  oponentChoices: Choice[]
  status: PlayerStatus
  playerTimeLeft: number
  oponentTimeLeft: number
  turn: boolean
}
