// Please commit this file to your repository
import * as Sentry from '@sentry/nuxt'
import { version as appVersion } from './package.json'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NUXT_PUBLIC_APP_BASE_URL || 'development',
    release: appVersion ? `app@${appVersion}` : undefined,
    tracesSampleRate: Number(process.env.SENTRY_TRACE_SAMPLE_RATE) || 1,
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 1,
  })
}
