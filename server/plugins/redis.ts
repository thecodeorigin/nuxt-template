import redisDriver from 'unstorage/drivers/redis'
import upstashDriver from 'unstorage/drivers/upstash'

export default defineNitroPlugin(() => {
  const storage = useStorage()

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const driver = upstashDriver({
      base: 'redis',
    })

    storage.mount('redis', driver)
  }
  else if (process.env.REDIS_HOST && process.env.REDIS_PASSWORD) {
    const driver = redisDriver({
      base: 'redis',
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 0,
    })

    storage.mount('redis', driver)
  }
})
