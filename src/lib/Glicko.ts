import { Glicko } from '@/firebase/models/users/User'
import { database } from '@/firebase/services'

const q = Math.LN10 / 400
const pisqr = Math.PI ** 2

async function getC() {
  const configSnap = await database.doc('config/rating').get()
  const configs = configSnap.data()
  return configs?.deviationInflation || 0
}

function getAge(glicko: Glicko) {
  const now = Date.now()
  return now - glicko.timestamp.getTime()
}

async function getRD(player: Glicko, c: number) {
  if (player.deviation === 0) return 0 // Tapa-buracos para prevenir que o Glicko do lmm2 infle com o tempo

  const t = getAge(player)
  const candidate = Math.sqrt(player.deviation ** 2 + c ** 2 * t)
  return Math.min(candidate, 350)
}

async function E(player: Glicko, oponent: Glicko, c: number) {
  const rdi = await getRD(oponent, c)
  return 1 / (1 + 10 ** ((g(rdi) * (oponent.rating - player.rating)) / 400))
}

function g(rd: number) {
  return 1 / Math.sqrt(1 + (3 * q ** 2 * rd ** 2) / pisqr)
}

async function newRating(
  player: Glicko,
  oponent: Glicko,
  s: number,
  c: number,
) {
  const rd = await getRD(player, c)
  const rdi = await getRD(oponent, c)
  const estimatedScore = await E(player, oponent, c)
  const dsqr =
    1 / (q ** 2 * g(rdi) ** 2 * estimatedScore * (1 - estimatedScore))
  return (
    player.rating +
    (q / (1 / rd ** 2 + 1 / dsqr)) * g(rdi) * (s - estimatedScore)
  )
}

async function newDeviation(player: Glicko, oponent: Glicko, c: number) {
  const rd = await getRD(player, c)
  const rdi = await getRD(oponent, c)
  const estimatedScore = await E(player, oponent, c) // Repeated calculations. Refactor.
  const dsqr =
    1 / (q ** 2 * g(rdi) ** 2 * estimatedScore * (1 - estimatedScore))
  return Math.sqrt(1 / (1 / rd ** 2 + 1 / dsqr))
}

export async function getNewRatings(
  player1: Glicko,
  player2: Glicko,
  player1Score: number,
): Promise<[Glicko, Glicko]> {
  const c = await getC()

  const rating1 = await newRating(player1, player2, player1Score, c)
  const rd1 = await newDeviation(player1, player2, c)

  const rating2 = await newRating(player2, player1, 1 - player1Score, c)
  const rd2 = await newDeviation(player2, player1, c)

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
