export const useHealthStore = defineStore('health', () => {
  async function fetchHealthCheck() {
    await $api<{ success: true }>('/api/health')
  }

  return {
    fetchHealthCheck,
  }
})
