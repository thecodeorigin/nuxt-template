<script setup lang="ts">
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'
import { satisfiesAbility } from '#layers/auth/shared/ability'

const authStore = useAuthStore()
const orgApi = useOrganizationApi()
const toast = useToast()

const { data: org, refresh } = await useAsyncData('active-org', () => orgApi.fetchOrganization())
const canManage = computed(() => satisfiesAbility(authStore.currentUser?.abilities ?? [], 'user:manage'))

const name = ref(org.value?.name ?? '')
watch(org, (v) => {
  name.value = v?.name ?? ''
})
const saving = ref(false)

async function save() {
  saving.value = true
  try {
    await orgApi.updateOrganization({ name: name.value })
    await refresh()
    toast.add({ title: 'Organization updated', color: 'success' })
  }
  catch (err: any) {
    toast.add({ title: 'Update failed', description: err?.data?.statusMessage ?? '', color: 'error' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <UPageCard title="General" description="Your organization details." variant="naked" orientation="horizontal" class="mb-4">
      <UButton v-if="canManage && !org?.is_system" label="Save changes" :loading="saving" class="w-fit lg:ms-auto" @click="save" />
    </UPageCard>
    <UPageCard variant="subtle">
      <UFormField label="Name" class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput v-model="name" :disabled="!canManage || org?.is_system" />
      </UFormField>
      <USeparator />
      <UFormField label="Slug" description="Used in URLs. Read-only." class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput :model-value="org?.slug" disabled />
      </UFormField>
      <USeparator />
      <UFormField label="Members" class="flex justify-between items-center gap-4">
        <UBadge :label="`${org?.memberCount ?? 0}`" color="neutral" variant="subtle" />
      </UFormField>
    </UPageCard>
  </div>
</template>
