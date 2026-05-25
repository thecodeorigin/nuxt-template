<script setup lang="ts">
import type { NotificationPrefs } from '#layers/auth/shared/schemas/user'

const authStore = useAuthStore()
const toast = useToast()

const DEFAULTS: NotificationPrefs = { email: true, product_updates: true, weekly_digest: false, important_updates: true }
const state = ref<NotificationPrefs>({ ...DEFAULTS })
const confirmDisableOpen = ref(false)

const { data, error } = useAsyncData('user-notification-prefs', () => authStore.fetchUserNotificationSettings(), { default: () => DEFAULTS })

syncRef(data, state)

whenError(error)

const subFields = [
  { name: 'product_updates' as const, label: 'Product updates', description: 'Receive messages about product updates.' },
  { name: 'weekly_digest' as const, label: 'Weekly digest', description: 'Receive a weekly summary.' },
  { name: 'important_updates' as const, label: 'Important updates', description: 'Receive security and billing updates.' },
]

async function persist() {
  try {
    await authStore.updateUserNotificationSettings({ ...state.value })
    toast.add({ title: 'Preferences saved', color: 'success' })
  }
  catch {
    toast.add({ title: 'Failed to save preferences', color: 'error' })
  }
}

function onEmailToggle(value: boolean) {
  // v-model has already mutated state.email. Hold an OFF behind a confirm.
  if (!value) {
    confirmDisableOpen.value = true
    return
  }
  persist()
}
function confirmDisable() {
  confirmDisableOpen.value = false
  persist()
}
function cancelDisable() {
  state.value.email = true
  confirmDisableOpen.value = false
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <UPageCard title="Notifications" description="Manage your notification settings." variant="naked" class="mb-4" />

    <UPageCard variant="subtle" :ui="{ container: 'divide-y divide-default' }">
      <UFormField
        name="email"
        label="Email notifications"
        description="Master switch. Turn off to stop ALL email — including billing and important account updates."
        class="flex items-center justify-between not-last:pb-4 gap-2"
      >
        <USwitch v-model="state.email" @update:model-value="onEmailToggle" />
      </UFormField>

      <UFormField
        v-for="field in subFields"
        :key="field.name"
        :name="field.name"
        :label="field.label"
        :description="field.description"
        class="flex items-center justify-between not-last:pb-4 pt-4 gap-2"
      >
        <USwitch v-model="state[field.name]" :disabled="!state.email" @update:model-value="persist" />
      </UFormField>
    </UPageCard>

    <UModal v-model:open="confirmDisableOpen" title="Turn off all email?" :ui="{ footer: 'justify-end' }">
      <template #body>
        <p class="text-sm text-muted">
          You will no longer receive <strong>any</strong> email from us — including
          <strong>billing notices, security alerts, and other important account updates</strong>.
          You can turn it back on at any time.
        </p>
      </template>
      <template #footer>
        <UButton color="neutral" variant="ghost" label="Keep email on" @click="cancelDisable" />
        <UButton color="error" label="Turn off all email" :loading="false" @click="confirmDisable" />
      </template>
    </UModal>
  </div>
</template>
