import { League, RatingData } from '@magic3t/common-types'
import { leaguesMap } from '@/utils/ranks'

const DIVISION_STRINGS = ['I', 'II', 'III', 'IV', 'V']

type Props = {
  rating: RatingData
}

export function RankingEmblem({ rating }: Props) {
  const leagueInfo = leaguesMap[rating.league]
  const bestOf5Status = rating.progress / 20

  return (
    <div className="flex flex-col items-center">
      <img src={leagueInfo.emblem} alt="" className="w-56 object-contain" />
      <p className="text-gold-1 tracking-wider font-serif font-medium text-2xl">
        {leagueInfo.name} {rating.division ? DIVISION_STRINGS[rating.division - 1] : ''}
      </p>
      {rating.league !== League.Provisional && (
        <p className="text-gold-4 tracking-wider font-serif font-bold text-lg">
          {rating.points} LP
        </p>
      )}
      {rating.league === League.Provisional && (
        <p className="text-grey-1 tracking-wider font-serif font-bold text-lg">
          {bestOf5Status} / 5
        </p>
      )}
    </div>
  )
}
