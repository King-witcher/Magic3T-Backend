import { Glicko } from '@/firebase/models/users/User'

const c = 0
const q = Math.LN10 / 400
const pisqr = Math.PI ** 2

function getAge(glicko: Glicko) {
  const now = Date.now()
  return ((now - glicko.timestamp.getTime()) / (1000 * 60 * 60 * 24)) % 1
}

function getRD(player: Glicko) {
  const t = getAge(player)
  return Math.min(Math.sqrt(player.deviation ** 2 + c ** 2 * t), 350)
}

function E(player: Glicko, oponent: Glicko) {
  const rdi = getRD(oponent)
  return 1 / (1 + 10 ** ((g(rdi) * (oponent.rating - player.rating)) / 400))
}

function g(rd: number) {
  return 1 / Math.sqrt(1 + (3 * q ** 2 * rd ** 2) / pisqr)
}

function newRating(player: Glicko, oponent: Glicko, s: number) {
  const rd = getRD(player)
  const rdi = getRD(oponent)
  const estimatedScore = E(player, oponent)
  const dsqr = 1 / (q ** 2 * g(rdi) ** 2 * estimatedScore * (1 - estimatedScore))
  return player.rating + (q / (1 / rd ** 2 + 1 / dsqr)) * g(rdi) * (s - estimatedScore)
}

function newDeviation(player: Glicko, oponent: Glicko) {
  const rd = getRD(player)
  const rdi = getRD(oponent)
  const estimatedScore = E(player, oponent) // Repeated calculations. Refactor.
  const dsqr = 1 / (q ** 2 * g(rdi) ** 2 * estimatedScore * (1 - estimatedScore))
  return Math.sqrt(1 / (1 / rd ** 2 + 1 / dsqr))
}

export function getNewRatings(player1: Glicko, player2: Glicko, player1Score: number): [Glicko, Glicko] {
  const rating1 = newRating(player1, player2, player1Score)
  const rd1 = newDeviation(player1, player2)

  const rating2 = newRating(player2, player1, 1 - player1Score)
  const rd2 = newDeviation(player2, player1)

  return [
    {
      rating: rating1,
      deviation: rd1,
      timestamp: new Date(),
    },
    {
      rating: rating2,
      deviation: rd2,
      timestamp: new Date(),
    },
  ]
}
