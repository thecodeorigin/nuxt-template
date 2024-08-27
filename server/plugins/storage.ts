import redisDriver from 'unstorage/drivers/redis'

export default defineNitroPlugin(() => {
  const storage = useStorage()
  const config = useRuntimeConfig()

  // Dynamically pass in credentials from runtime configuration, or other sources
  const driver = redisDriver({
    base: 'redis',
    host: config.redis.host,
    port: Number(config.redis.port),
    password: config.redis.password,
  })

  // Mount driver
  storage.mount('redis', driver)
})
