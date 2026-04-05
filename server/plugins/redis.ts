import memoryDriver from 'unstorage/drivers/memory'
import redisDriver from 'unstorage/drivers/redis'
import upstashDriver from 'unstorage/drivers/upstash'

export default defineNitroPlugin(() => {
  const runtimeConfig = useRuntimeConfig()
  const storage = useStorage()

  if (runtimeConfig.upstashRedisRestUrl && runtimeConfig.upstashRedisRestToken) {
    const driver = upstashDriver({
      base: 'redis',
      url: runtimeConfig.upstashRedisRestUrl,
      token: runtimeConfig.upstashRedisRestToken,
    })

    storage.mount('redis', driver)
  }
  else if (runtimeConfig.redisHost && runtimeConfig.redisPort) {
    const driver = redisDriver({
      base: 'redis',
      host: runtimeConfig.redisHost,
      port: runtimeConfig.redisPort,
      password: runtimeConfig.redisPassword || undefined,
      maxRetriesPerRequest: 20,
    })

    storage.mount('redis', driver)
  }
  else {
    // Fallback to memory driver if no redis is available
    const driver = memoryDriver()
    storage.mount('redis', driver)
  }
})
