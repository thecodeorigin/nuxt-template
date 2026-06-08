import { kv } from '@nuxthub/kv'

const WINDOW_SECONDS = 15 * 60
const PER_IP_MAX = 5
const GLOBAL_MAX = 100

function ipKey(ip: string): string {
  return `auth:login-fail:ip:${ip}`
}
const GLOBAL_KEY = 'auth:login-fail:global'

export async function digest(s: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length)
    return false
  let diff = 0
  for (let i = 0; i < a.length; i++)
    diff |= a[i]! ^ b[i]!
  return diff === 0
}

/** Throw 429 if this IP or the global breaker is over the limit. Call before validating. */
export async function assertLoginAllowed(ip: string): Promise<void> {
  const [perIp, global] = await Promise.all([
    kv.get<number>(ipKey(ip)),
    kv.get<number>(GLOBAL_KEY),
  ])
  if ((perIp ?? 0) >= PER_IP_MAX || (global ?? 0) >= GLOBAL_MAX)
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again later.' })
}

/** Increment fail counters (sliding TTL window). Call on every rejected attempt. */
export async function recordLoginFailure(ip: string): Promise<void> {
  const [perIp, global] = await Promise.all([
    kv.get<number>(ipKey(ip)),
    kv.get<number>(GLOBAL_KEY),
  ])
  await Promise.all([
    kv.set(ipKey(ip), (perIp ?? 0) + 1, { ttl: WINDOW_SECONDS }),
    kv.set(GLOBAL_KEY, (global ?? 0) + 1, { ttl: WINDOW_SECONDS }),
  ])
}

/** Clear this IP's counter on success. */
export async function clearLoginFailures(ip: string): Promise<void> {
  await kv.del(ipKey(ip))
}
