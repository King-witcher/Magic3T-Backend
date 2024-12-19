import { AuthRequest } from '@/auth/auth-request'
import { Perspective } from './match-side-adapter'

export type MatchRequest = AuthRequest & {
  perspective: Perspective
}
