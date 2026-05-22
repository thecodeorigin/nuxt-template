<script setup lang="ts">
import { useOrganizationMembers } from '#layers/auth/app/composables/useOrganizationMembers'

const open = defineModel<boolean>('open', { default: false })

const toast = useToast()
const { addMember } = useOrganizationMembers()

const email = ref('')
const busy = ref(false)

function close() {
  open.value = false
  email.value = ''
}

async function submit() {
  if (!email.value.trim())
    return
  busy.value = true
  try {
    await addMember(email.value.trim())
    toast.add({ title: 'Member added', color: 'success' })
    close()
  }
  catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Failed to add member', description: error?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Add member" :ui="{ footer: 'justify-end' }">
    <template #body>
      <UFormField label="Email address" required>
        <UInput
          v-model="email"
          type="email"
          placeholder="user@example.com"
          autofocus
          class="w-full"
          @keydown.enter="submit"
        />
      </UFormField>
    </template>

    <template #footer>
      <UButton color="neutral" variant="ghost" label="Cancel" @click="close" />
      <UButton
        label="Add member"
        :loading="busy"
        :disabled="!email.trim()"
        @click="submit"
      />
    </template>
  </UModal>
</template>
