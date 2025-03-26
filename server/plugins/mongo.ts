import mongodbDriver from 'unstorage/drivers/mongodb'

export default defineNitroPlugin(() => {
  const storage = useStorage()

  if (process.env.MONGODB_CONNECTION_STRING && process.env.MONGODB_DATABASE_NAME && process.env.MONGODB_COLLECTION_NAME) {
    const driver = mongodbDriver({
      connectionString: process.env.MONGODB_CONNECTION_STRING,
      databaseName: process.env.MONGODB_DATABASE_NAME,
      collectionName: process.env.MONGODB_COLLECTION_NAME,
    })

    storage.mount('mongodb', driver)
  }
})
