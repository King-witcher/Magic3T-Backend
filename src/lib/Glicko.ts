import { getRatingConfig } from '@/firebase/models/config'
import { Glicko } from '@/firebase/models/users/User'

const q = Math.LN10 / 400
const piSquare = Math.PI ** 2

function getAge(glicko: Glicko) {
  const now = Date.now()
  return now - glicko.timestamp.getTime()
}

function g(rd: number) {
  return 1 / Math.sqrt(1 + (3 * q ** 2 * rd ** 2) / piSquare)
}

export async function getNewRatings(
  player1: Glicko,
  player2: Glicko,
  player1Score: number,
): Promise<[Glicko, Glicko]> {
  const config = await getRatingConfig()

  const inflationConstant = Math.sqrt(
    (config.initialRD ** 2 - 40 ** 2) /
      (config.deviationInflationTime * 24 * 60 * 60 * 1000),
  )

  const rating1 = newRating(player1, player2, player1Score)
  const deviation1 = newDeviation(player1, player2)

  const rating2 = newRating(player2, player1, 1 - player1Score)
  const deviation2 = newDeviation(player2, player1)

  return [
    {
      rating: rating1,
      deviation: deviation1,
      timestamp: new Date(),
    },
    {
      rating: rating2,
      deviation: deviation2,
      timestamp: new Date(),
    },
  ]

  function getCurrentDeviation(player: Glicko) {
    if (player.deviation === 0) return 0 // Tapa-buracos para prevenir que o Glicko do lmm2 infle com o tempo

    const age = getAge(player)
    const agedDeviation = Math.sqrt(
      player.deviation ** 2 + inflationConstant ** 2 * age,
    )
    return Math.min(agedDeviation, config.initialRating)
  }

  function getExpectedScore(player: Glicko, opponent: Glicko) {
    const opponentDeviation = getCurrentDeviation(opponent)
    return (
      1 /
      (1 +
        10 **
          ((g(opponentDeviation) * (opponent.rating - player.rating)) / 400))
    )
  }

  function newRating(player: Glicko, opponent: Glicko, s: number) {
    const playerDeviation = getCurrentDeviation(player)
    const opponentDeviation = getCurrentDeviation(opponent)
    const expectedScore = getExpectedScore(player, opponent)
    const dSquare =
      1 /
      (q ** 2 * g(opponentDeviation) ** 2 * expectedScore * (1 - expectedScore))
    return (
      player.rating +
      (q / (1 / playerDeviation ** 2 + 1 / dSquare)) *
        g(opponentDeviation) *
        (s - expectedScore)
    )
  }

  function newDeviation(player: Glicko, oponent: Glicko) {
    const playerDeviation = getCurrentDeviation(player)
    const oponentDeviation = getCurrentDeviation(oponent)
    const expectedScore = getExpectedScore(player, oponent) // Repeated calculations. Refactor.
    const dSquare =
      1 /
      (q ** 2 * g(oponentDeviation) ** 2 * expectedScore * (1 - expectedScore))
    return Math.sqrt(1 / (1 / playerDeviation ** 2 + 1 / dSquare))
  }
}
