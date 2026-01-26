import { Choice } from '@magic3t/common-types'
import { useMemo } from 'react'
import { Panel } from '@/components/atoms'
import { Console, SystemCvars } from '@/lib/console'
import { cn } from '@/lib/utils'
import { getTriple } from '@/utils/getTriple'
import { NumberCell } from './number-cell'

interface GameBoardProps {
  allyChoices: Choice[]
  enemyChoices: Choice[]
  isMyTurn: boolean
  isGameOver: boolean
  onSelect: (choice: Choice) => void
}

const normalNumbers: Choice[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const magicSquareNumbers: Choice[] = [8, 1, 6, 3, 5, 7, 4, 9, 2]

export function GameBoard({
  allyChoices,
  enemyChoices,
  isMyTurn,
  isGameOver,
  onSelect,
}: GameBoardProps) {
  const magicSquare = Console.useCvarBoolean(SystemCvars.Ui3TMode)
  const numbers = magicSquare ? magicSquareNumbers : normalNumbers

  // Find winning triple if exists
  const winningTriple = useMemo(() => {
    if (allyChoices.length >= 3) {
      const triple = getTriple(allyChoices)
      if (triple) return triple
    }
    if (enemyChoices.length >= 3) {
      const triple = getTriple(enemyChoices)
      if (triple) return triple
    }
    return null
  }, [allyChoices, enemyChoices])

  const getCellState = (num: Choice) => {
    if (allyChoices.includes(num)) return 'ally' as const
    if (enemyChoices.includes(num)) return 'enemy' as const
    if (isGameOver || !isMyTurn) return 'disabled' as const
    return 'available' as const
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Board container with decorative frame */}
      <Panel className={cn('relative p-5 md:p-6', 'bg-linear-to-br from-grey-3/80 to-grey-2/80')}>
        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {numbers.map((num) => (
            <NumberCell
              key={num}
              value={num}
              state={getCellState(num)}
              highlight={winningTriple?.includes(num)}
              onClick={() => onSelect(num)}
            />
          ))}
        </div>

        {/* Turn indicator overlay */}
        {!isGameOver && !isMyTurn && (
          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
            <span className="text-gold-3 font-serif text-2xl font-bold uppercase tracking-wider animate-pulse select-none">
              Opponent&apos;s Turn
            </span>
          </div>
        )}
      </Panel>

      {/* Turn status text */}
      {!isGameOver && (
        <div
          className={cn(
            'px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider',
            'border-2 transition-all duration-300',
            isMyTurn
              ? 'bg-blue-600/20 border-blue-400/50 text-blue-300'
              : 'bg-red-600/20 border-red-400/50 text-red-300'
          )}
        >
          {isMyTurn ? 'Your Turn - Select a Number' : "Waiting for Opponent's Move"}
        </div>
      )}
    </div>
  )
}
