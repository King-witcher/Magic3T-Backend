import { Choice } from '@/types/Choice'
import { PlayerStatus } from './PlayerStatus'

/** Represents the game state from a specific player's point of view. */
export type PerspectiveGameState = {
  playerChoices: Choice[]
  opponentChoices: Choice[]
  status: PlayerStatus
  playerTimeLeft: number
  opponentTimeLeft: number
  turn: boolean
}
