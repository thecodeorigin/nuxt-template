export function getStorageSessionKey(providerAccountId: string) {
  return `session:${providerAccountId}`
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

  if (result)
    await storage.setItem(key, result as any)

  return result as T
}

export async function clearCache(key: string) {
  const storage = useStorage('mongodb')

  await storage.removeItem(key)
}
