import { GetUserResult } from '@magic3t/api-types'

interface ProfileStatsProps {
  user: GetUserResult
}

export function ProfileStats({ user }: ProfileStatsProps) {
  const { wins, draws, defeats } = user.stats
  const totalGames = wins + draws + defeats
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h2 className="font-serif font-bold text-xl text-gold-3 uppercase tracking-wide border-b border-gold-5/50 pb-2">
        Statistics
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Wins */}
        <div className="text-center p-4 bg-green-900/20 border border-green-600/30 rounded">
          <div className="font-serif font-bold text-2xl sm:text-3xl text-green-400">{wins}</div>
          <div className="text-sm text-green-300/80 uppercase tracking-wider">Wins</div>
        </div>

        {/* Draws */}
        <div className="text-center p-4 bg-grey-2/20 border border-grey-1/30 rounded">
          <div className="font-serif font-bold text-2xl sm:text-3xl text-grey-1">{draws}</div>
          <div className="text-sm text-grey-1/80 uppercase tracking-wider">Draws</div>
        </div>

        {/* Defeats */}
        <div className="text-center p-4 bg-red-900/20 border border-red-600/30 rounded">
          <div className="font-serif font-bold text-2xl sm:text-3xl text-red-400">{defeats}</div>
          <div className="text-sm text-red-300/80 uppercase tracking-wider">Defeats</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="flex justify-between items-center pt-2 border-t border-gold-5/30">
        <div className="text-grey-1">
          <span className="text-gold-2 font-semibold">{totalGames}</span> Total Games
        </div>
        <div className="text-grey-1">
          <span className="text-gold-2 font-semibold">{winRate}%</span> Win Rate
        </div>
      </div>
    </div>
  )
}
