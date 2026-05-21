import { kv } from '@nuxthub/kv'

export async function getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>, ttl = 3600): Promise<T> {
  const cached = await kv.get<T>(key)

  if (cached) {
    return cached
  }

  const data = await fetcher()

  if (data) {
    await kv.set(key, data, { ttl })
  }

  return data
}
