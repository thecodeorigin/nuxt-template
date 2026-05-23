<script setup lang="ts">
import type { NotificationPrefs } from '#layers/auth/shared/schemas/user'

const authStore = useAuthStore()
const toast = useToast()

const DEFAULTS: NotificationPrefs = { email: true, product_updates: true, weekly_digest: false, important_updates: true }
const state = reactive<NotificationPrefs>({ ...DEFAULTS })

const { data, error } = useAsyncData('user-notification-prefs', () => authStore.fetchUserNotificationSettings(), { default: () => DEFAULTS })
whenError(error)
watch(data, (v) => {
  if (v)
    Object.assign(state, v)
}, { immediate: true })

const sections = [{
  title: 'Notifications',
  description: 'Manage your notification settings.',
  fields: [
    { name: 'email' as const, label: 'Email', description: 'Receive product emails.' },
    { name: 'product_updates' as const, label: 'Product updates', description: 'Receive messages about product updates.' },
    { name: 'weekly_digest' as const, label: 'Weekly digest', description: 'Receive a weekly summary.' },
    { name: 'important_updates' as const, label: 'Important updates', description: 'Receive security and billing updates.' },
  ],
}]

async function persist() {
  try {
    await authStore.updateUserNotificationSettings({ ...state })
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
        <USwitch v-model="state[field.name]" @update:model-value="persist" />
      </UFormField>
    </UPageCard>
  </div>
</template>
