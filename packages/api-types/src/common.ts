export type ErrorResponse<T extends string = string> = {
  errorCode: T
  metadata?: unknown
}
