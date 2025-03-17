export const useCreditStore = defineStore('credit', () => {
  const currentUser = useLogtoUser()

  const credit = ref(currentUser?.custom_data?.credit || 0)

  async function updateCredit() {
    const response = await $api('/api/auth/me')

    credit.value = response.data?.custom_data?.credit || 0
  }

  return {
    credit,
    updateCredit,
  }
})
