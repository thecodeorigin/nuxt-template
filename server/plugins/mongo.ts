import mongodbDriver from 'unstorage/drivers/mongodb'

export default defineNitroPlugin(() => {
  const storage = useStorage()
  const config = useRuntimeConfig()

  // Dynamically pass in credentials from runtime configuration, or other sources
  const driver = mongodbDriver({
    connectionString: config.mongodb.connectionString,
    databaseName: config.mongodb.databaseName,
    collectionName: config.mongodb.collectionName,
  })

  // Mount driver
  storage.mount('mongodb', driver)
})
