import type { Team } from '@magic3t/common-types'
import type { MatchRowEvent, MatchRowTeam } from '@magic3t/database-types'

export type GetMatchResult = {
  id: string
  order: MatchRowTeam
  chaos: MatchRowTeam
  events: MatchRowEvent[]
  winner: Team | null
  date: Date
}

export type ListMatchesResultItem = {
  id: string
  order: MatchRowTeam
  chaos: MatchRowTeam
  events: MatchRowEvent[]
  winner: Team | null
  date: Date
}

export type ListMatchesResult = {
  matches: ListMatchesResultItem[]
  // pagination: {}
}

export type GetCurrentMatchResult = {}
