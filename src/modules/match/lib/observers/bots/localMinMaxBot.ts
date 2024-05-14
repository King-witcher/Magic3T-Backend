import { PerspectiveGameState } from '@modules/match/types/perspective.game.state'
import { Choice } from '@/types/Choice'
import { createTree } from '@/lib/LMM'
import { BaseBot } from '@modules/match/lib/observers/bots/baseBot'

function getMatchChoices(state: PerspectiveGameState, side: 'white' | 'black') {
  const white = side === 'white' ? state.playerChoices : state.oponentChoices
  const black = side === 'black' ? state.playerChoices : state.oponentChoices

  const result: Choice[] = []
  for (let i = 0; i < black.length; i++) {
    result.push(white[i], black[i])
  }
  if (white.length > black.length) result.push(white[black.length])
  return result
}

export class LocalMinMaxBot extends BaseBot {
  constructor(private readonly depth: number) {
    super()
  }

  think(state: PerspectiveGameState): Choice {
    const side =
      state.oponentChoices.length > state.playerChoices.length
        ? 'black'
        : 'white'

    const matchChoices = getMatchChoices(state, side)
    const tree = createTree(
      Math.min(this.depth, 9 - matchChoices.length),
      matchChoices,
    )

    const values: {
      loses: Choice[]
      draws: Choice[]
      wins: Choice[]
    } = {
      loses: [],
      draws: [],
      wins: [],
    }

    const winNumber = side === 'white' ? 1 : -1

    for (const branchId of Object.keys(tree.branches)) {
      if (!tree.branches[branchId]) continue
      if (tree.branches[branchId].value === winNumber) {
        values.wins.push(parseInt(branchId) as Choice)
      } else if (tree.branches[branchId].value === 0) {
        values.draws.push(parseInt(branchId) as Choice)
      } else {
        values.loses.push(parseInt(branchId) as Choice)
      }
    }

    if (values.wins.length) {
      return values.wins[Math.floor(Math.random() * values.wins.length)]
    } else if (values.draws.length) {
      return values.draws[Math.floor(Math.random() * values.draws.length)]
    } else if (values.loses.length) {
      return values.loses[Math.floor(Math.random() * values.loses.length)]
    }

    throw new Error('No available choices.')
  }
}
