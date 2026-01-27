export type ErrorResponse<T extends string = string> = {
  errorCode: T
  description?: string
  metadata?: unknown
}
