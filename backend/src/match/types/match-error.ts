import { MatchError } from '@magic3t/api-types'
import { ErrorResponseException } from '@/common'

/** Throw a match error */
export function matchException(errorCode: MatchError, httpStatus = 400): never {
  throw new ErrorResponseException<MatchError>(errorCode, httpStatus)
}
