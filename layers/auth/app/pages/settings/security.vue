<script setup lang="ts">
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'

const authStore = useAuthStore()
const orgApi = useOrganizationApi()
const toast = useToast()

const phone = ref(authStore.currentUser?.primary_phone ?? '')
const savingPhone = ref(false)
const deleting = ref(false)

async function savePhone() {
  savingPhone.value = true
  try {
    await authStore.updatePhoneNumber(phone.value)
    toast.add({ title: 'Phone updated', color: 'success' })
  }
  catch (err: any) {
    toast.add({ title: 'Failed to update phone', description: err?.data?.statusMessage ?? '', color: 'error' })
  }
  finally {
    savingPhone.value = false
  }
}

async function deleteAccount() {
  deleting.value = true
  try {
    await orgApi.deleteAccount()
    await navigateTo('/auth/login')
  }
  catch (err: any) {
    toast.add({ title: 'Cannot delete account', description: err?.data?.statusMessage ?? '', color: 'error' })
  }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <UPageCard title="Phone number" description="Used for account recovery and 2FA." variant="naked" class="mb-4" />
      <UPageCard variant="subtle">
        <UFormField name="phone" label="Phone" description="Format: +1234567890" class="flex max-sm:flex-col justify-between items-start gap-4">
          <div class="flex gap-2">
            <UInput v-model="phone" placeholder="+1234567890" />
            <UButton label="Save" :loading="savingPhone" @click="savePhone" />
          </div>
        </UFormField>
      </UPageCard>
    </div>

    <div>
      <UPageCard title="Danger zone" description="Irreversible account actions." variant="naked" class="mb-4" />
      <UPageCard variant="subtle" :ui="{ container: 'flex items-center justify-between gap-4' }">
        <div>
          <p class="font-medium text-highlighted">
            Delete account
          </p>
          <p class="text-sm text-muted">
            Permanently delete your account and all data.
          </p>
        </div>
        <UButton color="error" variant="soft" label="Delete account" :loading="deleting" @click="deleteAccount" />
      </UPageCard>
    </div>
  </div>
</template>
