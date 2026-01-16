import { WithId } from './with-id'

export type CrashReportRow = WithId & {
  source: 'client' | 'server'
  date: Date
  error: object
  metadata?: object
}
