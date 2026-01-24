import { cn } from '@/utils/utils'
import { RANKS } from './ranks'

export function RankCard({ rank }: { rank: (typeof RANKS)[number] }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-lg',
        'bg-linear-to-b',
        rank.color,
        'bg-opacity-20 border',
        rank.borderColor,
        rank.special && 'ring-2 ring-gold-4/50'
      )}
    >
      <img src={rank.icon} alt={rank.name} className="size-12" />
      <span className="font-serif font-bold text-gold-1">{rank.name}</span>
      {rank.divisions && <span className="text-grey-1 text-xs">{rank.divisions.join(' → ')}</span>}
      {rank.special && <span className="text-gold-3 text-xs font-semibold">Only 1 player!</span>}
    </div>
  )
}
