import { UserRowGlicko } from '@magic3t/database-types'

const piSquare = Math.PI ** 2

const q = Math.LN10 / 400

function g(rd: number) {
  return 1 / Math.sqrt(1 + (3 * q ** 2 * rd ** 2) / piSquare)
}

function getCurrentDeviation(deviation: number, timestamp: Date, inflation: number, maxRD: number) {
  if (deviation === 0) return 0 // Tapa-buracos para prevenir que o Glicko do lmm2 infle com o tempo

  const age = Date.now() - timestamp.getTime()
  const agedDeviation = Math.sqrt(deviation ** 2 + inflation ** 2 * age)
  return Math.min(agedDeviation, maxRD)
}

function getExpectedScore(first: number, second: number, secondDeviation: number) {
  return 1 / (1 + 10 ** ((g(secondDeviation) * (second - first)) / 400))
}

export function newRating(
  player: UserRowGlicko,
  opponent: UserRowGlicko,
  s: number,
  inflation: number,
  maxRD: number
) {
  const playerDeviation = getCurrentDeviation(player.deviation, player.timestamp, inflation, maxRD)
  const opponentDeviation = getCurrentDeviation(
    opponent.deviation,
    opponent.timestamp,
    inflation,
    maxRD
  )

  const expectedScore = getExpectedScore(player.rating, opponent.rating, opponentDeviation)

  const d2 = 1 / (q ** 2 * g(opponentDeviation) ** 2 * expectedScore * (1 - expectedScore))

  return (
    player.rating +
    (q / (1 / playerDeviation ** 2 + 1 / d2)) * g(opponentDeviation) * (s - expectedScore)
  )
}

export function newDeviation(
  player: UserRowGlicko,
  opponent: UserRowGlicko,
  inflation: number,
  maxRD: number
) {
  const playerDeviation = getCurrentDeviation(player.deviation, player.timestamp, inflation, maxRD)
  const opponentDeviation = getCurrentDeviation(
    opponent.deviation,
    opponent.timestamp,
    inflation,
    maxRD
  )

  const expectedScore = getExpectedScore(player.rating, opponent.rating, opponent.deviation)

  const dSquare = 1 / (q ** 2 * g(opponentDeviation) ** 2 * expectedScore * (1 - expectedScore))
  return Math.sqrt(1 / (1 / playerDeviation ** 2 + 1 / dSquare))
}

export function getInflation(inflationTime: number, maxRD: number) {
  return Math.sqrt((maxRD ** 2 - 40 ** 2) / (inflationTime * 24 * 60 * 60 * 1000))
}
