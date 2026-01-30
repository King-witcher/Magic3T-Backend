import * as Sentry from '@sentry/react'
import { router } from './router'

// TODO: https://docs.sentry.io/platforms/javascript/guides/react/#avoid-ad-blockers-with-tunneling-optional
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: import.meta.env.PROD,
  integrations: [
    Sentry.tanstackRouterBrowserTracingIntegration(router),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE) || 0.0,
  replaysSessionSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE) || 0.0,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,
})
