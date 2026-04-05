import mongodbDriver from 'unstorage/drivers/mongodb'

export default defineNitroPlugin(() => {
  const runtimeConfig = useRuntimeConfig()
  const storage = useStorage()

  if (runtimeConfig.mongodbUri && runtimeConfig.mongodbDatabaseName && runtimeConfig.mongodbCollectionName) {
    const driver = mongodbDriver({
      connectionString: runtimeConfig.mongodbUri,
      databaseName: runtimeConfig.mongodbDatabaseName,
      collectionName: runtimeConfig.mongodbCollectionName,
    })

    storage.mount('mongodb', driver)
  }
})
