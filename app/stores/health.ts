export const useHealthStore = defineStore('health', () => {
  const isHealthy = ref(true)

  async function fetchHealthCheck() {
    try {
      await $api<{ success: true }>('/api/health')

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
