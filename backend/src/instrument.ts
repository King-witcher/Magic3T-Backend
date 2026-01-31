import * as Sentry from '@sentry/nestjs'

// Ensure to call this before requiring any other modules!
const result = Sentry.init({
  dsn: process.env.SENTRY_DSN, // Not set from .env before instrumenting in development mode
  enabled: Boolean(process.env.SENTRY_DSN),
  enableLogs: true,
})

console.log('Sentry DSN:', result?.getDsn())
