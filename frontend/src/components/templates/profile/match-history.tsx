import { ListMatchesResult } from '@magic3t/api-types'
import { UseQueryResult } from '@tanstack/react-query'
import { GiSwordClash } from 'react-icons/gi'
import { Spinner } from '@/components/atoms'
import { MatchHistoryItem } from './match-history-item'

interface MatchHistoryProps {
  matchesQuery: UseQueryResult<ListMatchesResult, Error>
  currentUserId: string
}

export function MatchHistory({ matchesQuery, currentUserId }: MatchHistoryProps) {
  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center gap-3 border-b border-gold-5/50 pb-2">
        <GiSwordClash className="text-gold-3 text-2xl" />
        <h2 className="font-serif font-bold text-xl text-gold-3 uppercase tracking-wide">
          Match History
        </h2>
      </div>

      {/* Content */}
      {matchesQuery.isPending && (
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-8" />
          <span className="ml-3 text-grey-1">Loading matches...</span>
        </div>
      )}

      {matchesQuery.isError && (
        <div className="text-center py-8">
          <p className="text-red-400">Failed to load match history</p>
          <p className="text-grey-1 text-sm mt-1">{matchesQuery.error.message}</p>
        </div>
      )}

      {matchesQuery.isSuccess && (
        <>
          {matchesQuery.data.matches.length === 0 ? (
            <div className="text-center py-12">
              <GiSwordClash className="text-grey-1/50 text-5xl mx-auto mb-3" />
              <p className="text-grey-1">No matches played yet</p>
              <p className="text-grey-1/70 text-sm mt-1">
                Start playing to build your match history!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {matchesQuery.data.matches.map((match) => (
                <MatchHistoryItem key={match.id} match={match} currentUserId={currentUserId} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
