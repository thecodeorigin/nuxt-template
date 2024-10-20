export const useHealthStore = defineStore('health', () => {
  const isHealthy = ref(false)

  async function fetchHealthCheck() {
    try {
      await $api<{ success: true }>('/health')

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
