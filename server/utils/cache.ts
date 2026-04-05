export async function getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>, ttl = 3600): Promise<T> {
  const storage = useStorage('redis')
  const cached = await storage.getItem<T>(key)

  if (cached) {
    return cached
  }

  const data = await fetcher()

  if (data) {
    await storage.setItem(key, data, { ttl })
  }

  return data
}
