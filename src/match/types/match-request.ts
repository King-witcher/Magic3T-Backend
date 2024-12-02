import { AuthRequest } from '@/auth/auth-request'
import { MatchSideAdapter } from './match-side-adapter'

export type MatchRequest = AuthRequest & {
  matchAdapter: MatchSideAdapter
}
