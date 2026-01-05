import type { MatchPayload } from '../common'

export type GetMatchesResult = {
  matches: MatchPayload[]
  cursor: string | null
}
