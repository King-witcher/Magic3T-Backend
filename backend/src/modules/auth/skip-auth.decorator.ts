import { SetMetadata } from '@nestjs/common'

export const SKIP_AUTH_KEY = 'skipAuth'

export function SkipAuth() {
  return SetMetadata(SKIP_AUTH_KEY, true)
}
