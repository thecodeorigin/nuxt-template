import type { H3Event } from 'h3'
import { getRequestHost, getRequestProtocol } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * Resolve the public base URL.
 *
 * Pass the H3 event whenever you have one — the URL is then derived from the
 * live request, which works on any host (prod, preview, localhost) without
 * any env-var lookup. The fallback path is for non-request contexts only
 * (cron tasks, build-time, client-side).
 */
export function getBaseUrl(event?: H3Event): string {
  if (event) {
    // Read from the actual request only. Cloudflare's edge validates the Host
    // header against the configured route before invoking the Worker, so Host
    // is trusted; X-Forwarded-* is client-supplied and must NOT be trusted
    // here (the Worker is the edge — there is no upstream proxy to strip
    // client-supplied X-Forwarded-* headers).
    const protocol = getRequestProtocol(event)
    const host = getRequestHost(event)
    return `${protocol}://${host}`
  }

  const config = useRuntimeConfig()
  const protocol = config.public.sslEnabled ? 'https' : 'http'
  return `${protocol}://${config.public.baseDomain}`
}
