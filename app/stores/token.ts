export const useTokenDeviceStore = defineStore('token-device', {
  state: () => ({
    tokenDevice: null as string | null,
  }),
  actions: {
    async setTokenDevice(token: string) {
      try {
        this.tokenDevice = token
        await $api('/users/devices', {
          method: 'POST',
          body: { token },
        })
      }
      catch (error) {
        console.error(error)
      }
    },
    async clearTokenDevice() {
      try {
        await $api('/users/devices', {
          method: 'DELETE',
          body: { token: this.tokenDevice },
        })
        this.tokenDevice = null
      }
      catch (error) {
        console.error(error)
      }
    },
  },
})
