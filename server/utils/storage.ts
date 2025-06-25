import type { TransactionOptions } from 'unstorage'

export function getStorageSessionKey(providerAccountId: string) {
  return `session:${providerAccountId}`
}

export function getStorageStripeKey(identifier: string) {
  return `stripe:${identifier}`
}

function getStorage() {
  const config = useRuntimeConfig()

  return ((config.redis.host && config.redis.port && config.redis.password) || (config.upstash.url && config.upstash.token))
    ? useStorage('redis')
    : config.mongodb.connectionString
      ? useStorage('mongodb')
      : useStorage()
}

export async function tryWithCache<T>(key: string, getter: () => Promise<T | undefined | null>, options?: TransactionOptions) {
  const storage = getStorage()

  const cachedResult = await storage.getItem(key)

  if (cachedResult)
    return cachedResult as T

  const result = await getter()

  if (Array.isArray(result) ? result.length : result)
    await storage.setItem(key, result as any, options)

  return result as T
}

export async function clearCache(key: string) {
  const storage = getStorage()

  await storage.removeItem(key)
}
