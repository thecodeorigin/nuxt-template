import { defineStore } from 'pinia'

export const useTokenDeviceStore = defineStore('token-device', {
  state: () => ({
    tokenDevice: null as string | null,
  }),
  actions: {
    async setTokenDevice(token: string) {
      try {
        this.tokenDevice = token
        await useApi('/user-devices/register', {
          method: 'POST',
          body: {
            token,
          },
        })
      }
      catch (error) {
        console.error(error)
      }
    },
    async clearTokenDevice() {
      try {
        await useApi(createUrl('/user-devices/unregister'), {
          method: 'DELETE',
          body: {
            token: this.tokenDevice,
          },
        })
        this.tokenDevice = null
      }
      catch (error) {
        console.error(error)
      }
    },
  },
})
