import redisDriver from 'unstorage/drivers/redis'

export default defineNitroPlugin(() => {
  const storage = useStorage()
  const config = useRuntimeConfig()

  if (config.redis.host && config.redis.port && config.redis.password) {
    const driver = redisDriver({
      base: 'redis',
      host: config.redis.host,
      port: Number(config.redis.port),
      password: config.redis.password,
    })

    // Mount driver
    storage.mount('redis', driver)
  }
})
