import type { TransactionOptions } from 'unstorage'

export function getStorageStripeKey(identifier: string) {
  return `stripe:${identifier}`
}

export async function tryWithCache<T>(key: string, getter: () => Promise<T | undefined | null>, options?: TransactionOptions) {
  const storage = useStorage('redis')

  const cachedResult = await storage.getItem(key)

  if (cachedResult)
    return cachedResult as T

  const result = await getter()

  if (Array.isArray(result) ? result.length : result)
    await storage.setItem(key, result as any, options)

  return result as T
}

export async function clearCache(key: string) {
  const storage = useStorage('redis')

  await storage.removeItem(key)
}
