import { Player } from './Player'

export type ForfeitSchedule = {
  player: Player
  nodeTimeout: NodeJS.Timeout
}
