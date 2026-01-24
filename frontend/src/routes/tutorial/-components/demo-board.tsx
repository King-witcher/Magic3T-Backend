import { cn } from '@/utils/utils'
import { CellState } from './cell-state'
import { DemoCell } from './demo-cell'

export function DemoBoard({
  cells,
  size = 'md',
}: {
  cells: Array<{ value: number; state?: CellState }>
  size?: 'sm' | 'md'
}) {
  const gapClass = size === 'sm' ? 'gap-1.5' : 'gap-2'
  return (
    <div className={cn('grid grid-cols-3', gapClass)}>
      {cells.map((cell) => (
        <DemoCell key={cell.value} value={cell.value} state={cell.state} size={size} />
      ))}
    </div>
  )
}
