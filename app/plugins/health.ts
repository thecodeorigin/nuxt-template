export default defineNuxtPlugin({
  order: 1,
  enforce: 'pre',
  name: 'healthcheck',
  async setup() {
    const healthStore = useHealthStore()

    await healthStore.fetchHealthCheck()
  },
})
