<script setup lang="ts">
const authStore = useAuthStore()
const toast = useToast()

const { data: state } = await useAsyncData('user-notification-prefs', () => authStore.fetchUserNotificationSettings(), {
  default: () => ({ email: true, product_updates: true, weekly_digest: false, important_updates: true }),
})

const sections = [{
  title: 'Notifications',
  description: 'Manage your notification settings.',
  fields: [
    { name: 'email', label: 'Email', description: 'Receive product emails.' },
    { name: 'product_updates', label: 'Product updates', description: 'Receive messages about product updates.' },
    { name: 'weekly_digest', label: 'Weekly digest', description: 'Receive a weekly summary.' },
    { name: 'important_updates', label: 'Important updates', description: 'Receive security and billing updates.' },
  ],
}] as const

async function onChange() {
  try {
    await authStore.updateUserNotificationSettings({ ...state.value })
    toast.add({ title: 'Preferences saved', color: 'success' })
  }
  catch {
    toast.add({ title: 'Failed to save preferences', color: 'error' })
  }
}
</script>

<template>
  <div v-for="(section, i) in sections" :key="i">
    <UPageCard :title="section.title" :description="section.description" variant="naked" class="mb-4" />
    <UPageCard variant="subtle" :ui="{ container: 'divide-y divide-default' }">
      <UFormField
        v-for="field in section.fields"
        :key="field.name"
        :name="field.name"
        :label="field.label"
        :description="field.description"
        class="flex items-center justify-between not-last:pb-4 gap-2"
      >
        <USwitch :model-value="state[field.name]" @update:model-value="(v: boolean) => { state[field.name] = v; onChange() }" />
      </UFormField>
    </UPageCard>
  </div>
</template>
