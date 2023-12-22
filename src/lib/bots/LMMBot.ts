import { Player } from '@/modules/match/lib/Player'
import { PlayerChannel } from '@/modules/match/lib/PlayerChannel'
import { GameState } from '@/modules/match/types/POVGameState'
import { Choice } from '@/types/Choice'
import { createTree } from '../LMM'

function getMatchChoices(state: GameState, side: 'white' | 'black') {
  const white = side === 'white' ? state.playerChoices : state.oponentChoices
  const black = side === 'black' ? state.playerChoices : state.oponentChoices

  const result: Choice[] = []
  for (let i = 0; i < black.length; i++) {
    result.push(white[i], black[i])
  }
  if (white.length > black.length) result.push(white[black.length])
  return result
}

export class LMMBot {
  constructor(private player: Player, private depth: number = 2) {}

  private state: GameState

  getChannel(): PlayerChannel {
    const player = this.player
    const depth = this.depth
    return {
      sendMessage(message: string) {
        function respond(message: string) {
          player.oponent.channel.sendMessage(message)
        }

        switch (message) {
          case 'oi':
            respond('oi')
            break
        }
      },
      sendOponentUid() {
        //dn
      },
      sendState(state) {
        if (state.turn) {
          const matchChoices = getMatchChoices(state, player.side)
          const tree = createTree(
            Math.min(depth, 9 - matchChoices.length),
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

          const winNumber = player.side === 'white' ? 1 : -1

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
            player.onChoose(
              values.wins[Math.floor(Math.random() * values.wins.length)],
            )
          } else if (values.draws.length) {
            player.onChoose(
              values.draws[Math.floor(Math.random() * values.draws.length)],
            )
          } else if (values.loses.length) {
            player.onChoose(
              values.loses[Math.floor(Math.random() * values.loses.length)],
            )
          }

          player.match.emitState()
        }
      },
    }
  }
}
