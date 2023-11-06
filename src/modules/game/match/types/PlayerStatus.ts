/** Represents the status of a player among victory, defeat draw, playing or waiting. */
export enum PlayerStatus {
  Victory = 'victory',
  Defeat = 'defeat',
  Draw = 'draw',
  Playing = 'playing',
  /** Initial status, before both players are ready. */
  Waiting = 'waiting',
}
