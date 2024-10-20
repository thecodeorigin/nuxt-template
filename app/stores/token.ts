export const useTokenDeviceStore = defineStore('token-device', () => {
  const authStore = useAuthStore()

  const userId = computed(() => authStore.currentUser?.id || '')

  const tokenDevice = ref<string | null>(null)

  async function setTokenDevice(token: string) {
    try {
      tokenDevice.value = token
      await $api(`/users/${userId.value}/devices`, {
        method: 'POST',
        body: { token },
      })
    }
    catch (error) {
      console.error(error)
    }
  }

  async function clearTokenDevice() {
    try {
      await $api(`/users/${userId.value}/devices`, {
        method: 'DELETE',
        body: { token: tokenDevice.value },
      })
      tokenDevice.value = null
    }
    catch (error) {
      console.error(error)
    }
  }

  return {
    tokenDevice,
    setTokenDevice,
    clearTokenDevice,
  }
})
