export const useHealthStore = defineStore('health', () => {
  const isHealthy = ref(false)

  async function fetchHealthCheck() {
    try {
      await $api('/api/health')

      isHealthy.value = true
    }
    catch {
      isHealthy.value = false
    }
  }

  return {
    isHealthy,
    fetchHealthCheck,
  }
})
