// Please commit this file to your repository
import * as Sentry from '@sentry/nuxt'

const config = useRuntimeConfig()

if (config.public.sentry.dsn) {
  Sentry.init({
    dsn: config.public.sentry.dsn,
    environment: config.public.sentry.environment,
    release: config.public.sentry.release,
    tracesSampleRate: config.public.sentry.tracesSampleRate || 1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: config.public.sentry.replaysOnErrorSampleRate || 1,
    tracePropagationTargets: [
      /^\//,
      /^(api\/)/,
    ].filter(Boolean) as (string | RegExp)[],
    integrations: [
      Sentry.browserTracingIntegration({
        shouldCreateSpanForRequest: (url) => {
          return !url.includes('google-analytics')
        },
      }),
      Sentry.replayIntegration({
        networkDetailAllowUrls: [window.location.origin],
      }),
    ],
  })
}
