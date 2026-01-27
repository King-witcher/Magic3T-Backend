export type CrashReportCommand = {
  errorCode: string
  description: string
  metadata?: unknown
}

export type GetStatusResponse = {
  status: 'available'
  timestamp: string
}
