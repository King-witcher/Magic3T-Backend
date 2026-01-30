import { AuthenticRequest } from '@/modules/auth/auth-request'
import { Perspective } from '../lib'

export type MatchRequest = AuthenticRequest & {
  perspective: Perspective
}
