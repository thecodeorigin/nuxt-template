export function getStorageSessionKey(sub: string) {
  return `session:${sub}`
}

export function getStorageStripeKey(identifier: string) {
  return `stripe:${identifier}`
}

export async function tryWithCache<T>(key: string, getter: () => Promise<T | undefined | null>) {
  const storage = useStorage('mongodb')

  const cachedResult = await storage.getItem(key)

  if (cachedResult)
    return cachedResult as T

  const result = await getter()

  if (Array.isArray(result) ? result.length : result)
    await storage.setItem(key, result as any)

  return result as T
}

export async function clearCache(key: string) {
  const storage = useStorage('mongodb')

  await storage.removeItem(key)
}
