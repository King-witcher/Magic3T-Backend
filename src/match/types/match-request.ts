import { AuthRequest } from '@/auth/auth-request'
import { Perspective } from '../lib'

export type MatchRequest = AuthRequest & {
  perspective: Perspective
}
