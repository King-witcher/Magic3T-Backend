import { CellState } from './cell-state'
import { DemoBoard } from './demo-board'

export function WinningCombinationCard({
  numbers,
  description,
}: {
  numbers: number[]
  description: string
}) {
  const cells = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
    value: n,
    state: numbers.includes(n) ? ('highlight-ally' as CellState) : ('disabled' as CellState),
  }))

  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-grey-3/40 border border-gold-5/20">
      <DemoBoard cells={cells} size="sm" />
      <span className="text-gold-3 font-mono text-sm">{description}</span>
    </div>
  )
}
